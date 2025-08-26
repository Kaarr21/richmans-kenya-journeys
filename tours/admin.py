from django.contrib import admin

# Register your models here.
# tours/admin.py - New file
from django.contrib import admin
from django.utils.html import format_html
from .models import Tour

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'destination',
        'start_date',
        'end_date',
        'status_colored',
        'capacity_display',
        'price_per_person',
        'created_by'
    ]
    list_filter = [
        'status',
        'start_date',
        'destination',
        'created_by'
    ]
    search_fields = [
        'title',
        'destination',
        'description'
    ]
    readonly_fields = [
        'id',
        'available_spots',
        'is_full',
        'duration_days',
        'created_at',
        'updated_at'
    ]
    date_hierarchy = 'start_date'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Tour Information', {
            'fields': (
                'title',
                'description',
                'destination',
            )
        }),
        ('Schedule', {
            'fields': (
                'start_date',
                'end_date',
                'start_time',
                'status',
            )
        }),
        ('Capacity & Pricing', {
            'fields': (
                'max_capacity',
                'current_bookings',
                'price_per_person',
            )
        }),
        ('Notes', {
            'fields': (
                'notes',
            )
        }),
        ('System Information', {
            'fields': (
                'id',
                'available_spots',
                'is_full',
                'duration_days',
                'created_by',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',),
        }),
    )
    
    def status_colored(self, obj):
        colors = {
            'scheduled': 'blue',
            'active': 'green',
            'completed': 'gray',
            'cancelled': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colored.short_description = 'Status'
    status_colored.admin_order_field = 'status'
    
    def capacity_display(self, obj):
        percentage = (obj.current_bookings / obj.max_capacity) * 100 if obj.max_capacity > 0 else 0
        color = 'red' if obj.is_full else 'orange' if percentage > 75 else 'green'
        return format_html(
            '<span style="color: {};">{}/{} ({}%)</span>',
            color,
            obj.current_bookings,
            obj.max_capacity,
            int(percentage)
        )
    capacity_display.short_description = 'Capacity'
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['mark_active', 'mark_completed', 'mark_cancelled']
    
    def mark_active(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} tours marked as active.')
    mark_active.short_description = "Mark selected tours as active"
    
    def mark_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} tours marked as completed.')
    mark_completed.short_description = "Mark selected tours as completed"
    
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} tours marked as cancelled.')
    mark_cancelled.short_description = "Mark selected tours as cancelled"
    