from pydantic import BaseModel
from typing import List

class WarehouseStock(BaseModel):
    warehouse_name: str
    product_title: str
    sku: str
    quantity: int

class TopProduct(BaseModel):
    title: str
    sku: str
    total_shipped: int
    revenue: float

class DashboardStats(BaseModel):
    total_products: int
    total_warehouses: int
    total_movements: int
    total_inflows: int
    total_shipments: int
    total_revenue: float
    
    top_products: List[TopProduct]
    stock_distribution: List[WarehouseStock]
