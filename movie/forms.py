from django import forms


class RecommendationForm(forms.Form):
    prompt = forms.CharField(label='¿Qué te gustaría ver?', min_length=5, max_length=1000,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3,
            'placeholder': 'Una aventura espacial sobre amistad y exploración'}))
