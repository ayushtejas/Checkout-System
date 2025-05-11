from rest_framework import serializers
from .models import Product, DiscountRule

class DiscountRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountRule
        fields = ['quantity', 'discount_price']

class ProductSerializer(serializers.ModelSerializer):
    discounts = DiscountRuleSerializer(many=True, read_only=True)
    unit_price = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Product
        fields = ['code', 'name', 'unit_price', 'discounts']
