from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Budget
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import json


@csrf_exempt
def set_budget(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            category = data.get("category")
            limit = data.get("limit")

            if not category or limit is None:
                return JsonResponse(
                    {"message": "Missing fields: category or limit"}, status=400
                )

            # Use authenticated user if available, else fallback
            user = (
                request.user if request.user.is_authenticated else User.objects.first()
            )

            if not user:
                return JsonResponse(
                    {"message": "No user available to assign budget"}, status=404
                )

            budget = Budget.objects.create(
                user=user, category=category, limit=float(limit)
            )

            return JsonResponse(
                {"message": "Budget created successfully", "id": budget.id}, status=200
            )

        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse(
                {"message": "Error creating budget", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method"}, status=405)

@login_required
def get_all_budget_view(request):
    if request.method == "GET":
        budgets = Budget.objects.filter(user=request.user)
        data = []

        for b in budgets:
            try:
                user = User.objects.get(id=b.user_id)
                data.append(
                    {
                        "id": b.id,
                        "user_id": user.id,
                        "username": user.username,
                        "category": b.category,
                        "limit": float(b.limit),
                        "spent": float(b.spent),
                    }
                )
            except User.DoesNotExist:
                # Skip this budget if user doesn't exist
                continue

        return JsonResponse(data, safe=False, status=200)

    return JsonResponse({"message": "Invalid request method."}, status=405)


@csrf_exempt
def edit_budget(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            budget_id = data.get("id")
            category = data.get("category")
            limit = data.get("limit")

            if not budget_id:
                return JsonResponse({"message": "Budget ID is required"}, status=400)

            budget = Budget.objects.get(id=budget_id)

            if category:
                budget.category = category
            if limit is not None:
                budget.limit = float(limit)

            budget.save()

            return JsonResponse({"message": "Budget updated successfully"}, status=200)

        except Budget.DoesNotExist:
            return JsonResponse({"message": "Budget not found"}, status=404)
        except Exception as e:
            return JsonResponse(
                {"message": "Error updating budget", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method"}, status=405)


@csrf_exempt
def delete_budget(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            budget_id = data.get("id")

            if not budget_id:
                return JsonResponse({"message": "Budget ID is required"}, status=400)

            budget = Budget.objects.get(id=budget_id)
            budget.delete()

            return JsonResponse({"message": "Budget deleted successfully"}, status=200)

        except Budget.DoesNotExist:
            return JsonResponse({"message": "Budget not found"}, status=404)
        except Exception as e:
            return JsonResponse(
                {"message": "Error deleting budget", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method"}, status=405)


@csrf_exempt
# @login_required
def user_budgets_view(request):
    if request.method == "GET":
        user = request.user
        budgets = Budget.objects.filter(user=user)
        data = [
            {
                "id": b.id,
                "user_id": user.id,
                "username": user.username,
                "category": b.category,
                "limit": float(b.limit),
                "spent": float(b.spent),
            }
            for b in budgets
        ]
        return JsonResponse({"budgets": data}, status=200)

    return JsonResponse({"message": "Invalid request method"}, status=405)

@csrf_exempt
@login_required
def update_budget_limit(request, budget_id):

    if not request.user:
        return JsonResponse({"message": "Authentication required"}, status=401)

    if request.method != "PATCH":  # or PATCH if you prefer
        return JsonResponse({"message": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf‑8"))
        limit = data.get("limit")

        if limit is None or float(limit) < 0:
            return JsonResponse(
                {"message": "Limit is required and must be ≥ 0"}, status=400
            )

        budget = Budget.objects.get(id=budget_id, user=request.user)
        budget.limit = float(limit)
        budget.save()

        return JsonResponse(
            {
                "id": budget.id,
                "category": budget.category,
                "limit": budget.limit,
                "spent": budget.spent,
            },
            status=200,
        )

    except Budget.DoesNotExist:
        return JsonResponse({"message": "Budget not found"}, status=404)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"message": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse(
            {"message": "Something went wrong", "error": str(e)}, status=500
        )
