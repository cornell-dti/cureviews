import string
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from load_course_info import loadCourseDesc, getSubjects

subjects_url = "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=FA23"
subjects = getSubjects(subjects_url)

urls = [f"https://classes.cornell.edu/api/2.0/search/classes.json?roster=FA23&subject={sub}" for sub in subjects]

def fetchDescriptions(urls):
    descriptions = []
    for x in urls:
        descriptions += loadCourseDesc(x)
    print(len(descriptions))
    return descriptions


course_descriptions = fetchDescriptions(urls)
def preprocess_text(text):
    """ Tokenization and preprocessing with custom stopwords"""
    custom_stopwords = ["of", "the", "in", "and", "on", "an", "a", "to"]
    strong_words = ["technology","calculus","business", "Artificial Intelligence", "First-Year Writing", "computer","python","java","economics","US","writing","biology","chemistry", "physics", "engineering","ancient"
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

tagged_data = [TaggedDocument(words=desc.split(), tags=[str(i)]) for i, desc in enumerate(preprocessed_descriptions)]

model = Doc2Vec(vector_size=20, window=2, min_count=1, workers=4, epochs=100)
model.build_vocab(tagged_data)
model.train(tagged_data, total_examples=model.corpus_count, epochs=model.epochs)



def createClusters():
    """ Creates the clusters for assigned documents based on the Doc2Vec similarity if cluster is full then we start a new cluster.
    Also puts into clusters by most similar cluster.
     """
    last = 0
    inner_clusters = {}

    for i, desc in enumerate(preprocessed_descriptions):
        most_similar_cluster_id = None
        max_similarity = 0 

        for cluster_id, cluster_vector in inner_clusters.items():
            similarity = model.dv.similarity(i, cluster_id)
            if similarity > max_similarity and len(inner_clusters[cluster_id]) <= 50:
                max_similarity = similarity
                most_similar_cluster_id = cluster_id

        if most_similar_cluster_id is not None:
            inner_clusters[most_similar_cluster_id].append(course_descriptions[i])
        else:
            inner_clusters[last] = [course_descriptions[i]]
            last += 1

    return inner_clusters






clusters = createClusters()
def merge_single_item_clusters(clusters):
    """ for all small clusters, merge them with their most similar cluster"""
    singles = [cluster_id for cluster_id, courses in clusters.items() if len(courses) < 50]
    for single_cluster_id in singles:
        max_similarity = -1
        most_similar_cluster = None

        for cluster_id, courses in clusters.items():
            if cluster_id != single_cluster_id:
                similarity = model.dv.similarity(single_cluster_id, cluster_id)
                if similarity > max_similarity:
                    max_similarity = similarity
                    most_similar_cluster = cluster_id

        if most_similar_cluster is not None:
            clusters[most_similar_cluster].extend(clusters[single_cluster_id])
            del clusters[single_cluster_id]

    return clusters

clusters = merge_single_item_clusters(clusters)



with open('output.txt', 'w') as file:
    for cluster_id, courses in clusters.items():
        file.write(f"Cluster {cluster_id + 1}:\n")
        for course in courses:
            if course :
                file.write(course + '\n')
        file.write("\n")

