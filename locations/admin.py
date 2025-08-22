from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Location, LocationImage

class LocationImageInline(admin.TabularInline):
    model = LocationImage
    extra = 1
    fields = ['image', 'caption', 'order']

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['title', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [LocationImageInline]
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.user = request.user
        super().save_model(request, obj, form, change)

@admin.register(LocationImage)
class LocationImageAdmin(admin.ModelAdmin):
    list_display = ['location', 'caption', 'order', 'created_at']
    list_filter = ['created_at', 'location']
    search_fields = ['caption', 'location__title']
    readonly_fields = ['id', 'created_at']
    