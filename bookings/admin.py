from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.utils.html import format_html
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'customer_name', 
        'destination', 
        'status_colored',
        'group_size',
        'confirmed_date',
        'amount',
        'created_at'
    ]
    list_filter = [
        'status', 
        'created_at', 
        'confirmed_date',
        'group_size'
    ]
    search_fields = [
        'customer_name', 
        'customer_email', 
        'destination',
        'id'
    ]
    readonly_fields = [
        'id', 
        'created_at', 
        'updated_at',
        'customer_notified',
        'last_notification_sent'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Customer Information', {
            'fields': (
                'customer_name',
                'customer_email', 
                'customer_phone',
            )
        }),
        ('Booking Details', {
            'fields': (
                'destination',
                'group_size',
                'preferred_date',
                'confirmed_date',
                'confirmed_time',
                'duration_days',
                'amount',
                'status',
            )
        }),
        ('Messages & Notes', {
            'fields': (
                'special_requests',
                'admin_message',
                'notes',
            )
        }),
        ('System Information', {
            'fields': (
                'id',
                'created_at',
                'updated_at',
                'customer_notified',
                'last_notification_sent',
            ),
            'classes': ('collapse',),
        }),
    )
    
    def status_colored(self, obj):
        colors = {
            'pending': 'orange',
            'confirmed': 'green',
            'cancelled': 'red',
            'completed': 'blue',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colored.short_description = 'Status'
    status_colored.admin_order_field = 'status'
    
    actions = ['mark_confirmed', 'mark_cancelled', 'mark_completed']
    
    def mark_confirmed(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} bookings marked as confirmed.')
    mark_confirmed.short_description = "Mark selected bookings as confirmed"
    
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} bookings marked as cancelled.')
    mark_cancelled.short_description = "Mark selected bookings as cancelled"
    
    def mark_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} bookings marked as completed.')
    mark_completed.short_description = "Mark selected bookings as completed"
    