from django.contrib.sitemaps import Sitemap
from django.urls import reverse

class StaticViewSitemap(Sitemap):
    priority = 0.8
    changefreq = 'weekly'
    protocol = 'https'

    def items(self):
        return ['index', 'gallery', 'book-tour']

    def location(self, item):
        return f'/{item}' if item != 'index' else '/'

class LocationSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7
    protocol = 'https'

    def items(self):
        from locations.models import Location
        return Location.objects.all()

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/location/{obj.id}'