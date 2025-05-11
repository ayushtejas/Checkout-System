from django.db import models
from decimal import Decimal

class Product(models.Model):
    code = models.CharField(max_length=1, unique=True)
    name = models.CharField(max_length=100)
    unit_price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.code})"

class DiscountRule(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='discounts')
    quantity = models.PositiveIntegerField()
    discount_price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} - {self.quantity} for {self.discount_price}"
