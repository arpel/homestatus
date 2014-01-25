from flask import Blueprint, render_template, flash, request, json

from appname import cache
from appname.forms import MyForm

from getData import dataCollecter

main = Blueprint('main', __name__)

dc = dataCollecter()

@main.route('/')
@cache.cached(timeout=1000)
def home():
    return render_template('index.html')

@main.route('/tempdetails')
@cache.cached(timeout=1000)
def tempdetails():
    return render_template('tempdetails.html')

@main.route('/getdata', methods=['GET'])
def getdata():
    streams = json.loads(request.args.get('streams'))
    dlist = json.loads(request.args.get('dlist'))

    return dc.getHistorywithGuess(streams, dlist)

@main.route('/wtform', methods=['GET', 'POST'])
def wtform():
    form = MyForm()

    if request.method == 'GET':
        return render_template('wtform_example.html', form=form)
    elif request.method == 'POST':
        if form.validate_on_submit():
            flash("The form was successfully submitted", 'success')
        else:
            flash("There was a problem submitting the form!", 'danger')
        return render_template('wtform_example.html', form=form)
