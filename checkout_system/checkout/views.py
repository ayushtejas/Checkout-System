from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product, DiscountRule
from collections import Counter
from rest_framework import viewsets
from .serializers import ProductSerializer
import logging

logger = logging.getLogger(__name__)

class CheckoutView(APIView):
    def post(self, request):
        try:
            # Get items from request data and ensure it's a list
            items = request.data.get("items", [])
            if not isinstance(items, list):
                return Response(
                    {"error": "Items must be a list"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Count items
            item_counts = Counter(items)
            total_price = 0

            # Process each item
            for code, count in item_counts.items():
                try:
                    product = Product.objects.get(code=code)
                    discounts = product.discounts.order_by('-quantity')  # max quantity first

                    # Apply discounts
                    remaining_count = count
                    for discount in discounts:
                        if remaining_count >= discount.quantity:
                            num_discounts = remaining_count // discount.quantity
                            total_price += num_discounts * discount.discount_price
                            remaining_count %= discount.quantity

                    # Add price for remaining items
                    total_price += remaining_count * product.unit_price

                except Product.DoesNotExist:
                    logger.warning(f"Product with code {code} not found")
                    continue

            return Response({
                "total_price": float(total_price),
                "items_processed": len(item_counts)
            })

        except Exception as e:
            logger.error(f"Error in checkout: {str(e)}")
            return Response(
                {"error": "An error occurred while processing the checkout"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
