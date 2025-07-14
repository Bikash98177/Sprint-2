from django.db import models
from django.contrib.auth.models import User
from budget.models import Budget

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


class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    date = models.DateField()
    notes = models.TextField(blank=True)
    receipt = models.FileField(upload_to='receipts/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.amount}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_amount = 0
        old_category = None

        if not is_new:
            old_expense = Expense.objects.get(pk=self.pk)
            old_amount = float(old_expense.amount)
            old_category = old_expense.category

        super().save(*args, **kwargs)

        try:
            if is_new:
                # New expense: increase spent
                budget = Budget.objects.get(user=self.user, category=self.category)
                budget.spent += float(self.amount)
                budget.save()

            else:
                # Existing expense updated
                if old_category == self.category:
                    # Same category → adjust only amount
                    budget = Budget.objects.get(user=self.user, category=self.category)
                    budget.spent += float(self.amount) - old_amount
                    budget.save()
                else:
                    # Category changed → adjust old and new budgets
                    old_budget = Budget.objects.get(user=self.user, category=old_category)
                    old_budget.spent -= old_amount
                    old_budget.save()

                    new_budget = Budget.objects.get(user=self.user, category=self.category)
                    new_budget.spent += float(self.amount)
                    new_budget.save()
        except Budget.DoesNotExist:
            pass  # You can choose to raise an error or create the missing budget