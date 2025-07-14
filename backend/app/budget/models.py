from django.db import models
from django.contrib.auth.models import User

# Predefined categories (same for both models)
CATEGORY_CHOICES = [
    ("Food & Dining", "Food & Dining"),
    ("Transportation", "Transportation"),
    ("Housing", "Housing"),
    ("Utilities", "Utilities"),
    ("Entertainment", "Entertainment"),
    ("Shopping", "Shopping"),
    ("Healthcare", "Healthcare"),
    ("Personal Care", "Personal Care"),
    ("Education", "Education"),
    ("Travel", "Travel"),
    ("Gifts & Donations", "Gifts & Donations"),
    ("Other", "Other"),
]


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    limit = models.FloatField()
    spent = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.user.username} - {self.category}"