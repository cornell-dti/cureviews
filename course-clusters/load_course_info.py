import requests

def loadCourseDesc(url):
    lis = []
    res = requests.get(url)
    data = res.json()
    for x in data['data']['classes']:
        lis.append(x['description'])
    return lis


def getSubjects(url):
    res = requests.get(url)
    data = res.json()
    return [x['value'] for x in data['data']['subjects']]

