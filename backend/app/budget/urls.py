from django.urls import path
from . import views

urlpatterns = [
    path("setBudget/", views.set_budget, name="set_budget"),
    path("getAllBudget/", views.get_all_budget_view, name="get_all_budget"),
    path("editBudget/", views.edit_budget, name="edit_budget"),
    path("deleteBudget/", views.delete_budget, name="delete_budget"),
    path("getUserBudgets/", views.user_budgets_view, name="user_budgets_view"),
    path("edit/<int:budget_id>/", views.update_budget_limit, name="update_budget_limit"),
]
