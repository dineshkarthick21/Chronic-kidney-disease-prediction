from sklearn.feature_selection import SelectKBest, f_classif
import numpy as np


def apply_feature_selection(X, y, k=10):
    # Handle case where k is more than available features
    n_features = X.shape[1]
    k = min(k, n_features)
    
    selector = SelectKBest(score_func=f_classif, k=k)
    X_selected = selector.fit_transform(X, y)
    return X_selected, selector
