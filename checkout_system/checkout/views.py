from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product, DiscountRule
from collections import Counter
from rest_framework import viewsets
from .serializers import ProductSerializer

class CheckoutView(APIView):
    def post(self, request):
        items = request.data.get("items", "")
        item_counts = Counter(items)

        total_price = 0

        for code, count in item_counts.items():
            try:
                product = Product.objects.get(code=code)
                discounts = product.discounts.order_by('-quantity')  # max quantity first

                for discount in discounts:
                    if count >= discount.quantity:
                        num_discounts = count // discount.quantity
                        total_price += num_discounts * discount.discount_price
                        count %= discount.quantity

                total_price += count * product.unit_price

            except Product.DoesNotExist:
                continue  # Or raise an error

        return Response({"total_price": float(total_price)})

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
