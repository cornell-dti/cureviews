import requests

url = "https://classes.cornell.edu/api/2.0/search/classes.json?roster=FA14&subject=CS"
subjects_url = "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=FA23"


def loadCourseDesc(url):
    lis = []
    res = requests.get(url)
    data = res.json()
    for x in data['data']['classes']:
        lis.append(x['description'])
    return lis

def getSubjects(url):
    res = requests.get(url)
    print(res.status_code)
    data = res.json()
    return [x['value'] for x in data['data']['subjects']]


subjects = getSubjects(subjects_url)
urls = [f"https://classes.cornell.edu/api/2.0/search/classes.json?roster=FA23&subject={sub}" for sub in subjects]

def fetchDescriptions(urls):
    descriptions = []
    for x in urls:
        descriptions += loadCourseDesc(x)
    print(len(descriptions))
    return descriptions

course_descriptions = fetchDescriptions(urls)

