from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Expense
from django.contrib.auth.models import User
import datetime


@csrf_exempt
def set_expense_view(request):

    if request.method == "POST":
        try:
            name = request.POST.get("name")
            amount = request.POST.get("amount")
            category = request.POST.get("category")
            date = request.POST.get("date")
            notes = request.POST.get("notes", "")
            receipt = request.FILES.get("receipt")  # Get uploaded file

            print(
                f"Received data: name={name}, amount={amount}, category={category}, date={date}, notes={notes}, receipt={receipt}"
            )

            if not name or not amount or not category or not date:
                return JsonResponse({"message": "Missing required fields"}, status=400)

            expense = Expense.objects.create(
                user=request.user,
                name=name,
                amount=amount,
                category=category,
                date=datetime.datetime.strptime(date, "%Y-%m-%d").date(),
                notes=notes,
                receipt=receipt,
            )

            return JsonResponse({"message": "Expense saved successfully"}, status=200)

        except Exception as e:
            return JsonResponse(
                {"message": "Error processing request", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method"}, status=405)


@csrf_exempt
def get_all_expense_view(request):
    if request.method == "GET":
        expenses = Expense.objects.all()
        data = []
        for exp in expenses:
            data.append(
                {
                    "id": exp.id,
                    "name": exp.name,
                    "amount": float(exp.amount),
                    "category": exp.category,
                    "date": exp.date.strftime("%Y-%m-%d"),
                    "notes": exp.notes,
                    "receipt_url": exp.receipt.url if exp.receipt else None,
                    "user_id": exp.user.id,
                }
            )
        return JsonResponse(data, safe=False, status=200)

    return JsonResponse({"message": "Invalid request method."}, status=405)


@csrf_exempt
def get_expense_view_by_Id(request):
    if request.method == "GET":
        exp_id = request.GET.get("id")

        if not exp_id:
            return JsonResponse({"message": "Expense ID is required."}, status=400)

        try:
            exp = Expense.objects.get(id=exp_id)
            data = {
                "id": exp.id,
                "name": exp.name,
                "amount": float(exp.amount),
                "category": exp.category,
                "date": exp.date.strftime("%Y-%m-%d"),
                "notes": exp.notes,
                "receipt_url": exp.receipt.url if exp.receipt else None,
            }
            return JsonResponse(data, status=200)

        except Expense.DoesNotExist:
            return JsonResponse({"message": "Expense not found."}, status=404)

    return JsonResponse({"message": "Invalid request method."}, status=405)


@csrf_exempt
def edit_expense_view(request):
    if request.method == "POST":

        exp_id = request.POST.get("id")
        name = request.POST.get("name")
        amount = request.POST.get("amount")
        category = request.POST.get("category")
        date = request.POST.get("date")
        notes = request.POST.get("notes", "")
        receipt = request.FILES.get("receipt")

        if not exp_id or not name or not amount or not category or not date:
            return JsonResponse({"message": "Missing required fields"}, status=400)

        try:
            exp = Expense.objects.get(id=exp_id)
            exp.name = name
            exp.amount = amount
            exp.category = category
            exp.date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            exp.notes = notes
            if receipt:
                exp.receipt = receipt
            exp.save()

            return JsonResponse({"message": "Expense edited successfully"}, status=200)

        except Expense.DoesNotExist:
            return JsonResponse({"message": "Expense not found"}, status=404)
        except Exception as e:
            return JsonResponse(
                {"message": "Error processing request", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method"}, status=405)


@csrf_exempt
def delete_expense_view(request):
    if request.method == "POST":
        exp_id = request.POST.get("id")
        if not exp_id:
            return JsonResponse({"message": "Expense ID is required"}, status=400)

        try:
            exp = Expense.objects.get(id=exp_id)
            exp.delete()
            return JsonResponse({"message": "Expense deleted successfully"}, status=200)

        except Expense.DoesNotExist:
            return JsonResponse({"message": "Expense not found"}, status=404)
        except Exception as e:
            return JsonResponse(
                {"message": "Error processing request", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method"}, status=405)


@csrf_exempt
def get_user_expenses_view(request):
    if request.method == "GET":
        expenses = Expense.objects.filter(user=request.user).order_by("-date")
        data = []
        for exp in expenses:
            data.append(
                {
                    "id": exp.id,
                    "name": exp.name,
                    "amount": float(exp.amount),
                    "category": exp.category,
                    "date": exp.date.strftime("%Y-%m-%d"),
                    "notes": exp.notes,
                    "receipt_url": exp.receipt.url if exp.receipt else None,
                    "user_id": exp.user.id,
                }
            )
        return JsonResponse(data, safe=False, status=200)

    return JsonResponse({"message": "Invalid request method."}, status=405)
