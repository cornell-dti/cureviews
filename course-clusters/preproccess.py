import string
from load_course_info import course_descriptions

def preprocess_text(text):
    """ Tokenization and preprocessing with custom stopwords"""
    custom_stopwords = ["of", "the", "in", "and", "on", "an", "a", "to"]
    strong_words = ["technology","calculus","buisness", "Artificial Intelligence", "First-Year Writing", "computer","python","java","economics","US","writing","biology","chemistry", "physics", "engineering","ancient"
                    "programming", "algorithms", "data structures","art","software","anthropology" "databases","fiction","mathematics", "history","civilization"]

    translator = str.maketrans("", "", string.punctuation)
    text = text.lower()
    text = text.translate(translator)
    tokens = text.split()
    tokens = [token for token in tokens if token not in custom_stopwords]
    for word in strong_words:
        if word in tokens:
            tokens += [word] * 10
    return " ".join(tokens)

def removeStopwords():
    "Removes stopwords for all the descriptions "
    preprocessed = []
    for desc in course_descriptions:
        if desc:
            preprocessed.append(preprocess_text(desc))
    return preprocessed

preprocessed_descriptions = removeStopwords()