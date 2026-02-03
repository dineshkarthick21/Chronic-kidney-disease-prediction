from sklearn.feature_selection import SelectKBest, f_classif


def apply_feature_selection(X, y, k=10):
    selector = SelectKBest(score_func=f_classif, k=k)
    X_selected = selector.fit_transform(X, y)
    return X_selected, selector
