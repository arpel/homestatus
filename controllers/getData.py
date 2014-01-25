from flask import Flask, jsonify
import xively
import datetime, arrow

from appname import cache

class cleanpoint():
	def __init__(self, value, at):
		self.value = value
		self.at = at

class dataCollecter():
	def __init__(self):
		self.api = xively.XivelyAPIClient("bI-PWNeyFPrHnJOq7tclJGLVjDiSAKxOSlRJNVVYMTBnbz0g")
		self.feed = self.api.feeds.get(97289)
		self.id = "001"
		self.datapointmanager = None

	def old(self):
		#points = stream.datapoints.history(start=now, duration='1second')
		
		points =  self.feed.datastreams.get("1", start=datetime.datetime(2013, 7, 1, 14, 0, 0), end=datetime.datetime(2013, 7, 1, 16, 0, 0)).datapoints
		
		print points
		jsonpoints = [{'at': x.at, 'value': x.value} for x in points]
		#print jsonpoints

	@cache.memoize(240)
	def test(self):
		now = datetime.datetime.utcnow()

		datapointmanager = self.feed.datastreams.get("1").datapoints
		points =  datapointmanager.history(start=datetime.datetime(2013, 7, 1, 14, 0, 0), end=datetime.datetime(2013, 7, 1, 16, 0, 0))

		jsonpoints = [{'at': x.at, 'value': x.value} for x in points]
		#print jsonpoints

		return jsonify(status="Done", points=jsonpoints)

	def __repr__(self):
		return "%s(%s)" % (self.__class__.__name__, self.id)

	@cache.memoize(20160)
	def getDatapointManager(self, stream):
		self.datapointmanager = self.feed.datastreams.get(stream).datapoints

	#@cache.memoize(20160)
	def getSingleHistory(self, stream, start, end, duration=None, limit=None, interval_type=None, interval=None, async=False):
		#Stream parameter needed to correctly respond to cache requests
		print(stream, self, start, end, duration, limit, interval_type, interval)

		if async:
			self.datapointmanager.history_async(start=start, end=end, duration=duration, limit=limit, interval_type=interval_type, interval=interval)
		else:
			points =  self.datapointmanager.history(start=start, end=end, duration=duration, limit=limit, interval_type=interval_type, interval=interval)
			return self.formatHistoryPoints(points)

	def formatHistoryPoints(self, points):
		# Little formatting
		cleanpoints = []
		for point in points:
			p = cleanpoint(float(point.value), arrow.get(point.at))
			cleanpoints.append(p)
		
		return cleanpoints

	# Intented to be called with start, end and interval (in sec) parameters only !
	def getHistorywithGuess(self, stream_list, duration_list):
		#print stream_list
		#print duration_list

		# Build duration list
		MAX_REQUEST_ITEMS=900
		requests = []
		start, end, interval = arrow.get(duration_list[0]['start']), arrow.get(duration_list[0]['end']), int(duration_list[0]['interval'])

		# Special Cached intervals
		if interval == 300:
			# 5 minutes : 12 points /hour : 12 hours : 12*60*60 = 43200 (144 points) 
			time_width = 43200
			start = start.floor('hour')
		elif interval == 30:
			# 30 sec : 120 points /hour : 8 hours : 8*60*60 = 28800 (8*120 = 960 points)
			time_width = 28800
			start = start.floor('hour')
		else:
			time_width = MAX_REQUEST_ITEMS * interval

		start_b = start
		next_boundary = start_b.replace(seconds=+time_width)
		while next_boundary < end:
			requests.append({"start": start_b, "end": next_boundary})
			start_b = next_boundary
			next_boundary = next_boundary.replace(seconds=+time_width)

		requests.append({"start": start_b, "end": end})
		#print requests

		# Get everything from DB
		all_data = []

		for stream in stream_list:
			one_stream_data = []
			
			self.getDatapointManager(stream['stream'])

			for duration in requests:
				try:
					itype = duration_list[0]['interval_type']
				except:
					itype = None
				#one_stream_data.extend(self.getSingleHistory(stream=stream['stream'], start=duration["start"], end=duration["end"], limit=MAX_REQUEST_ITEMS, interval=interval , interval_type=itype))
				self.getSingleHistory(stream=stream['stream'], start=duration["start"], end=duration["end"], limit=MAX_REQUEST_ITEMS, interval=interval , interval_type=itype, async=True)
			#One time to fetch everything
			points = self.datapointmanager.history_map()
			one_stream_data.extend( self.formatHistoryPoints(points) )

			all_data.append({'stream': stream, 'data': one_stream_data})

	    # Toggle
		toggle_data = []
		previous = 50
		current = 0
		nbH = 0
		nbL = 0
		heating = False
		for d in all_data:
			try:
				if d['stream']['toggle']:
					for point in d['data']:
						current = point.value
						if current > (previous + 0.15): 
							if not heating:
								toggle_data.append([point.at.isoformat()])
								heating = True
							nbH += 1 
						else:
							if heating:
								toggle_data[-1].append(point.at.isoformat())
								heating = False
							nbL += 1

						previous = current;
					# Last element
					if heating:
						toggle_data[-1].append(point.at.isoformat())
			except:
				print "No toggle found in stream %d" % (d['stream']['stream'])
 				pass

		print "Low : %d | High : %d" % (nbL, nbH);

		# Organized data
		labels = []
		markers = []

		serie_len = len(all_data)
		organized_data = []
		index = 1
		for serie in all_data:
			for point in serie['data']:
				points = ['null'] * (serie_len+1)
				points[0] = point.at.isoformat()
				points[index] = point.value
				organized_data.append(points)
			index += 1

			labels.append(serie['stream']['label'])
			markers.append(serie['stream']['marker'])

		#jsonpoints = [{'at': x.at, 'value': x.value} for x in points]
		#json_toggle = [{'s': x[0], 'e': x[1]} for x in toggle_data]
		return jsonify(type="Dygraph", nbL=nbL, nbH=nbH, toggle=toggle_data, organized_data=organized_data, markers=markers, labels=labels)