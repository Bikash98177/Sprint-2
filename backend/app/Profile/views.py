from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password


@csrf_exempt
def get_User_profile_view(request):
    user = request.user 

    user_id = user.id
    
    if not user_id:
        return JsonResponse({"success": False, "message": "User not authenticated"}, status=401)  
      
    try:
        user = User.objects.get(id=user_id)     
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)
    

    profile_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }

    return JsonResponse({"success": True, "profile": profile_data})


@csrf_exempt
def update_profile_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            name = data.get("name")
            email = data.get("email")

            user = User.objects.get(id=user_id)
            if name:
                user.first_name = name
            if email:
                user.email = email
            user.save()

            return JsonResponse({"message": "Profile updated successfully"})

        except User.DoesNotExist:
            return JsonResponse({"message": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse(
                {"message": "Error updating profile", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method"}, status=405)


@csrf_exempt
def change_password_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            new_password = data.get("new_password")

            user = User.objects.get(id=user_id)
            user.password = make_password(new_password)
            user.save()

            return JsonResponse({"message": "Password changed successfully"})
        except User.DoesNotExist:
            return JsonResponse({"message": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse(
                {"message": "Error changing password", "error": str(e)}, status=500
            )

    return JsonResponse({"message": "Invalid request method"}, status=405)
