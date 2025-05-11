from django.core.management.base import BaseCommand
from checkout.models import Product, DiscountRule
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populates the database with sample products and discount rules'

    def handle(self, *args, **kwargs):
        # Clear existing data
        Product.objects.all().delete()

        # Create products
        products_data = [
            {'code': 'A', 'name': 'Product A', 'unit_price': Decimal('50.00')},
            {'code': 'B', 'name': 'Product B', 'unit_price': Decimal('30.00')},
            {'code': 'C', 'name': 'Product C', 'unit_price': Decimal('20.00')},
            {'code': 'D', 'name': 'Product D', 'unit_price': Decimal('15.00')},
        ]

        for product_data in products_data:
            product = Product.objects.create(**product_data)
            self.stdout.write(f'Created product: {product.name}')

        # Create discount rules
        discount_rules = [
            {'product_code': 'A', 'quantity': 3, 'discount_price': Decimal('130.00')},
            {'product_code': 'B', 'quantity': 2, 'discount_price': Decimal('45.00')},
        ]

        for rule in discount_rules:
            product = Product.objects.get(code=rule['product_code'])
            DiscountRule.objects.create(
                product=product,
                quantity=rule['quantity'],
                discount_price=rule['discount_price']
            )
            self.stdout.write(f'Created discount rule for {product.name}')
