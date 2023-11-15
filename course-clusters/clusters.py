from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from sklearn.metrics.pairwise import cosine_similarity
from preproccess import preprocessed_descriptions
from loadclass import course_descriptions

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


def get_top_similar_courses(clusters, model):
    """Gets the top 10 most similar courses for each course in a cluster"""
    res = {}
    for cluster_id, cluster in clusters.items():
        for course_id, outcourse in enumerate(cluster):
            if outcourse == None:
                continue
            max_10 = []
            vec_outcourse = model.infer_vector([outcourse])
            for inner, innercourse in enumerate(cluster):
                if innercourse is not None and inner != course_id:
                    vec_innercourse = model.infer_vector([innercourse])
                    val = cosine_similarity([vec_outcourse],[vec_innercourse])[0][0]
                    max_10.append((val, innercourse))
            max_10.sort(reverse=True)
            res[outcourse] = [max_10[i][1] for i in range(11)]
    return res


clusters = createClusters()
merged_clusters = merge_single_item_clusters(clusters)
top_similar_courses = get_top_similar_courses(merged_clusters, model)
