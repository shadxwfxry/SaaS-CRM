from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.inventory import Inventory, Movement
from app.models.shipment import Shipment
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Возвращает агрегированную статистику для дашборда:
    - Общее количество складов, товаров, операций
    - Выручку и топ продаваемых товаров (на основе выполненных сделок DELIVERED)
    - Оставшиеся запасы на складах для мониторинга
    """
    cid = current_user.company_id
    
    # Basic counts
    total_products = (await session.execute(select(func.count(Product.id)).filter_by(company_id=cid))).scalar() or 0
    total_warehouses = (await session.execute(select(func.count(Warehouse.id)).filter_by(company_id=cid))).scalar() or 0
    total_movements = (await session.execute(select(func.count(Movement.id)).filter_by(company_id=cid))).scalar() or 0
    total_inflows = (await session.execute(select(func.count(Movement.id)).filter_by(company_id=cid, type='IN'))).scalar() or 0
    total_shipments = (await session.execute(select(func.count(Shipment.id)).filter_by(company_id=cid))).scalar() or 0

    # Revenue
    revenue_query = select(func.sum(Product.price * Shipment.quantity)).where(
        Shipment.product_id == Product.id, 
        Shipment.status == 'DELIVERED',
        Shipment.company_id == cid
    )
    total_revenue = (await session.execute(revenue_query)).scalar() or 0.0

    # Top products
    top_products_query = (
        select(
            Product.title,
            Product.sku,
            func.sum(Shipment.quantity).label('total_shipped'),
            func.sum(Product.price * Shipment.quantity).label('revenue')
        )
        .where(
            Shipment.product_id == Product.id, 
            Shipment.status == 'DELIVERED',
            Shipment.company_id == cid
        )
        .group_by(Product.id)
        .order_by(desc('total_shipped'))
        .limit(5)
    )
    top_products_result = await session.execute(top_products_query)
    top_products = [
        {
            "title": r.title,
            "sku": r.sku,
            "total_shipped": r.total_shipped,
            "revenue": r.revenue
        }
        for r in top_products_result.all()
    ]

    # Stock distribution
    stock_query = (
        select(
            Warehouse.name.label('warehouse_name'),
            Product.title.label('product_title'),
            Product.sku.label('sku'),
            Inventory.quantity
        )
        .select_from(Warehouse)
        .join(Inventory, Warehouse.id == Inventory.warehouse_id)
        .join(Product, Product.id == Inventory.product_id)
        .filter(Inventory.quantity > 0, Inventory.company_id == cid)
    )
    stock_result = await session.execute(stock_query)
    stock_dist = [
        {
            "warehouse_name": r.warehouse_name,
            "product_title": r.product_title,
            "sku": r.sku,
            "quantity": r.quantity
        }
        for r in stock_result.all()
    ]
    
    return DashboardStats(
        total_products=total_products,
        total_warehouses=total_warehouses,
        total_movements=total_movements,
        total_inflows=total_inflows,
        total_shipments=total_shipments,
        total_revenue=total_revenue,
        top_products=top_products,
        stock_distribution=stock_dist
    )
