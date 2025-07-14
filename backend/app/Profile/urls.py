from django.urls import path
from . import views 

urlpatterns = [
    path('getUserProfile/', views.get_User_profile_view, name='get_User_profile_view'),
    path('updateProfile/', views.update_profile_view, name='update_profile_view'),
    path('changePassword/', views.change_password_view, name='change_password_view'),
]