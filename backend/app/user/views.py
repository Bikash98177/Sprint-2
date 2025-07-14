from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from budget.models import Budget

BUDGET_CATEGORIES = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Utilities",
    "Entertainment",
    "Shopping",
    "Healthcare",
    "Personal Care",
    "Education",
    "Travel",
    "Gifts & Donations",
    "Miscellenous",
]


@csrf_exempt
def register_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))

            name = data.get("name")
            email = data.get("email")
            password = data.get("password")

            if not name or not email or not password:
                return JsonResponse({"message": "All fields are required."}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({"message": "Email already taken."}, status=400)

            # ✅ Create user and save to DB
            user = User.objects.create(
                username=name, email=email, password=make_password(password)
            )

            # ✅ Create default budgets
            for category in BUDGET_CATEGORIES:
                Budget.objects.create(user=user, category=category, limit=0)

            return JsonResponse(
                {"message": "User registered successfully."}, status=200
            )

        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON."}, status=400)

        except Exception as e:
            return JsonResponse(
                {"message": "Something went wrong.", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method."}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            password = data.get("password")

        except Exception:
            return JsonResponse({"message": "Invalid JSON"}, status=400)

        if not name or not password:
            return JsonResponse(
                {"message": "Username and password required."}, status=400
            )

        user = authenticate(request, username=name, password=password)

        if user:
            login(request, user)
            return JsonResponse({"message": "Login successful"}, status=200)
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=401)

    return JsonResponse({"message": "Invalid request method"}, status=405)


@csrf_exempt
def logout_view(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            logout(request)
            return JsonResponse({"message": "Logged out successfully."}, status=200)
        else:
            return JsonResponse({"message": "User not logged in."}, status=400)

    return JsonResponse({"message": "Invalid request method."}, status=405)


@login_required
def current_user_view(request):
    if request.method == "GET":
        return JsonResponse({"username": request.user.username, "id": request.user.id}, status=200)
    return JsonResponse({"message": "Invalid request method."}, status=405)
