# richman_backend/sitemaps.py - New file for SEO
from django.contrib.sitemaps import Sitemap
from django.urls import reverse

class StaticViewSitemap(Sitemap):
    priority = 0.8
    changefreq = 'weekly'
    protocol = 'https'

    def items(self):
        return ['index', 'gallery', 'book-tour']

    def location(self, item):
        if item == 'index':
            return '/'
        return f'/{item}/'

class LocationSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7
    protocol = 'https'

    def items(self):
        try:
            from locations.models import Location
            return Location.objects.all()
        except:
            return []

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/gallery/'  # Since all locations show in gallery