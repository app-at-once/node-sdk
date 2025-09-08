/**
 * AppAtOnce SDK Analytics Examples
 * Demonstrates real-time analytics, aggregations, time-series data, and business metrics
 * All examples work dynamically based on each project/app database
 */

const { AppAtOnceClient } = require('@appatonce/node-sdk');

// Initialize client with API key (project-level or app-level)
const client = AppAtOnceClient.create(process.env.APPATONCE_API_KEY);

async function main() {
  console.log('🚀 AppAtOnce Analytics Examples\n');

  // Example 1: Basic Analytics Queries
  await basicAnalyticsExamples();

  // Example 2: Real-time Analytics with Updates
  await realtimeAnalyticsExample();

  // Example 3: Time-series Data Analysis
  await timeSeriesExamples();

  // Example 4: Business Metrics Dashboard
  await businessMetricsExamples();

  // Example 5: Advanced Aggregations
  await advancedAggregationExamples();

  // Example 6: Custom Analytics Filters
  await customFilterExamples();
}

/**
 * Example 1: Basic Analytics Queries
 * Shows COUNT, SUM, AVG, MIN, MAX, DISTINCT operations
 */
async function basicAnalyticsExamples() {
  console.log('📊 Basic Analytics Examples');
  console.log('=' .repeat(50));

  try {
    // Using the fluent API - analytics are available on any table query
    const ordersTable = client.table('orders');

    // 1. Count total orders
    const totalOrders = await ordersTable.analytics.count();
    console.log(`Total Orders: ${totalOrders}`);

    // 2. Sum of all order values
    const totalRevenue = await ordersTable.analytics.sum('total_amount');
    console.log(`Total Revenue: $${totalRevenue}`);

    // 3. Average order value
    const avgOrderValue = await ordersTable.analytics.avg('total_amount');
    console.log(`Average Order Value: $${avgOrderValue.toFixed(2)}`);

    // 4. Min and Max order amounts
    const minOrder = await ordersTable.analytics.min('total_amount');
    const maxOrder = await ordersTable.analytics.max('total_amount');
    console.log(`Order Range: $${minOrder} - $${maxOrder}`);

    // 5. Distinct customers
    const uniqueCustomers = await ordersTable.analytics.countDistinct('customer_id');
    console.log(`Unique Customers: ${uniqueCustomers}`);

    // 6. Analytics with filters
    const todayRevenue = await ordersTable.analytics.sum('total_amount', {
      created_at: { gte: new Date().toISOString().split('T')[0] }
    });
    console.log(`Today's Revenue: $${todayRevenue}`);

  } catch (error) {
    console.error('❌ Basic analytics error:', error.message);
  }

  console.log('\n');
}

/**
 * Example 2: Real-time Analytics with Live Updates
 * Demonstrates WebSocket-based real-time analytics
 */
async function realtimeAnalyticsExample() {
  console.log('⚡ Real-time Analytics Example');
  console.log('=' .repeat(50));

  try {
    const ordersTable = client.table('orders');

    // Set up real-time order count monitoring
    console.log('📡 Starting real-time order monitoring...');
    
    const unsubscribe = ordersTable.analytics.realtime(
      {
        metric: 'count',
        timeRange: '1h' // Last hour
      },
      (result) => {
        const count = result.data?.[0]?.value || 0;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Live Order Count (Last Hour): ${count}`);
      }
    );

    // Let it run for 30 seconds
    setTimeout(() => {
      unsubscribe();
      console.log('🔕 Real-time monitoring stopped\n');
    }, 30000);

    // Real-time revenue tracking
    const revenueUnsubscribe = ordersTable.analytics.realtime(
      {
        metric: 'sum',
        column: 'total_amount',
        timeRange: '24h'
      },
      (result) => {
        const revenue = result.data?.[0]?.value || 0;
        console.log(`💰 Live Revenue (24h): $${revenue.toFixed(2)}`);
      }
    );

    setTimeout(() => {
      revenueUnsubscribe();
    }, 30000);

  } catch (error) {
    console.error('❌ Real-time analytics error:', error.message);
  }
}

/**
 * Example 3: Time-series Data Analysis
 * Shows hourly, daily, weekly, monthly aggregations
 */
async function timeSeriesExamples() {
  console.log('📈 Time-series Analytics Examples');
  console.log('=' .repeat(50));

  try {
    const ordersTable = client.table('orders');

    // 1. Hourly order count for last 24 hours
    console.log('⏰ Hourly Order Trends (Last 24h):');
    const hourlyOrders = await ordersTable.analytics.timeSeries({
      metric: 'count',
      interval: 'hour',
      timeRange: '24h'
    });

    hourlyOrders.slice(-5).forEach(point => {
      const hour = new Date(point.timestamp).getHours();
      console.log(`  ${hour}:00 - ${point.value} orders`);
    });

    // 2. Daily revenue for last 30 days
    console.log('\n💵 Daily Revenue Trends (Last 30d):');
    const dailyRevenue = await ordersTable.analytics.timeSeries({
      metric: 'sum',
      column: 'total_amount',
      interval: 'day',
      timeRange: '30d'
    });

    dailyRevenue.slice(-7).forEach(point => {
      const date = new Date(point.timestamp).toLocaleDateString();
      console.log(`  ${date} - $${point.value.toFixed(2)}`);
    });

    // 3. Weekly average order value
    console.log('\n📊 Weekly Average Order Value (Last 12w):');
    const weeklyAvg = await ordersTable.analytics.timeSeries({
      metric: 'avg',
      column: 'total_amount',
      interval: 'week',
      timeRange: '12w'
    });

    weeklyAvg.slice(-4).forEach(point => {
      const week = new Date(point.timestamp).toLocaleDateString();
      console.log(`  Week of ${week} - $${point.value.toFixed(2)} avg`);
    });

    // 4. Monthly growth analysis
    console.log('\n📈 Monthly Growth Analysis (Last 12m):');
    const monthlyMetrics = await ordersTable.analytics.timeSeries({
      metric: 'count',
      interval: 'month',
      timeRange: '12m'
    });

    let previousMonth = null;
    monthlyMetrics.slice(-3).forEach(point => {
      const month = new Date(point.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      const growth = previousMonth 
        ? ((point.value - previousMonth) / previousMonth * 100).toFixed(1)
        : 'N/A';
      
      console.log(`  ${month} - ${point.value} orders (${growth}% growth)`);
      previousMonth = point.value;
    });

  } catch (error) {
    console.error('❌ Time-series analytics error:', error.message);
  }

  console.log('\n');
}

/**
 * Example 4: Business Metrics Dashboard
 * Demonstrates key business metrics calculation
 */
async function businessMetricsExamples() {
  console.log('🎯 Business Metrics Dashboard');
  console.log('=' .repeat(50));

  try {
    const ordersTable = client.table('orders');
    const customersTable = client.table('customers');
    const productsTable = client.table('products');

    // 1. Key Performance Indicators (KPIs)
    console.log('📊 Key Performance Indicators:');
    
    const [totalOrders, totalRevenue, uniqueCustomers] = await Promise.all([
      ordersTable.analytics.count(),
      ordersTable.analytics.sum('total_amount'),
      ordersTable.analytics.countDistinct('customer_id')
    ]);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    console.log(`  Total Orders: ${totalOrders.toLocaleString()}`);
    console.log(`  Total Revenue: $${totalRevenue.toLocaleString()}`);
    console.log(`  Unique Customers: ${uniqueCustomers.toLocaleString()}`);
    console.log(`  Average Order Value: $${avgOrderValue.toFixed(2)}`);

    // 2. Customer Segmentation
    console.log('\n👥 Customer Segmentation by Order Value:');
    const customerSegments = await ordersTable.analytics.groupBy({
      metric: 'sum',
      column: 'total_amount',
      groupBy: ['customer_id'],
      limit: 100
    });

    // Categorize customers
    const highValue = customerSegments.filter(c => c.value >= 1000).length;
    const mediumValue = customerSegments.filter(c => c.value >= 100 && c.value < 1000).length;
    const lowValue = customerSegments.filter(c => c.value < 100).length;

    console.log(`  High Value ($1000+): ${highValue} customers`);
    console.log(`  Medium Value ($100-999): ${mediumValue} customers`);
    console.log(`  Low Value (<$100): ${lowValue} customers`);

    // 3. Product Performance
    console.log('\n🛍️ Top Products by Revenue:');
    const productRevenue = await ordersTable.analytics.query({
      metric: 'sum',
      column: 'total_amount',
      groupBy: ['product_id'],
      limit: 5
    });

    productRevenue.data.forEach((product, index) => {
      console.log(`  ${index + 1}. Product ID ${product.product_id}: $${product.value.toFixed(2)}`);
    });

    // 4. Geographic Analysis
    console.log('\n🌍 Revenue by Region:');
    const regionRevenue = await ordersTable.analytics.groupBy({
      metric: 'sum',
      column: 'total_amount',
      groupBy: ['shipping_region'],
      limit: 5
    });

    regionRevenue.forEach((region, index) => {
      console.log(`  ${index + 1}. ${region.shipping_region}: $${region.value.toFixed(2)}`);
    });

    // 5. Conversion Funnel
    console.log('\n📊 Sales Funnel Analysis:');
    
    // Simulate funnel stages with filters
    const [visitors, leads, customers, orders] = await Promise.all([
      client.table('website_visits').analytics.countDistinct('visitor_id'),
      client.table('leads').analytics.count(),
      customersTable.analytics.count(),
      ordersTable.analytics.count()
    ]);

    const leadConversion = visitors > 0 ? (leads / visitors * 100).toFixed(1) : 0;
    const customerConversion = leads > 0 ? (customers / leads * 100).toFixed(1) : 0;
    const orderConversion = customers > 0 ? (orders / customers * 100).toFixed(1) : 0;

    console.log(`  Visitors: ${visitors.toLocaleString()}`);
    console.log(`  Leads: ${leads.toLocaleString()} (${leadConversion}% conversion)`);
    console.log(`  Customers: ${customers.toLocaleString()} (${customerConversion}% conversion)`);
    console.log(`  Orders: ${orders.toLocaleString()} (${orderConversion}% conversion)`);

  } catch (error) {
    console.error('❌ Business metrics error:', error.message);
  }

  console.log('\n');
}

/**
 * Example 5: Advanced Aggregation Examples
 * Complex multi-dimensional analytics
 */
async function advancedAggregationExamples() {
  console.log('🔧 Advanced Aggregation Examples');
  console.log('=' .repeat(50));

  try {
    const ordersTable = client.table('orders');

    // 1. Multi-dimensional analysis
    console.log('🎛️ Multi-dimensional Revenue Analysis:');
    const multiDimensional = await ordersTable.analytics.query({
      metric: 'sum',
      column: 'total_amount',
      groupBy: ['product_category', 'customer_tier'],
      timeRange: '30d',
      limit: 10
    });

    console.log('  Top Category/Tier Combinations:');
    multiDimensional.data.slice(0, 5).forEach((item, index) => {
      console.log(`    ${index + 1}. ${item.product_category} / ${item.customer_tier}: $${item.value.toFixed(2)}`);
    });

    // 2. Cohort Analysis
    console.log('\n👥 Monthly Cohort Analysis:');
    const cohortData = await ordersTable.analytics.timeSeries({
      metric: 'count',
      interval: 'month',
      timeRange: '12m',
      filters: {
        customer_type: 'new'
      }
    });

    cohortData.slice(-6).forEach(point => {
      const month = new Date(point.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      console.log(`    ${month}: ${point.value} new customers`);
    });

    // 3. Retention Analysis
    console.log('\n🔄 Customer Retention by Month:');
    
    // Get repeat customers per month
    const repeatCustomers = await ordersTable.analytics.query({
      metric: 'distinct',
      column: 'customer_id',
      timeGroup: 'month',
      timeRange: '6m',
      filters: {
        order_number: { gt: 1 } // Customers with more than 1 order
      }
    });

    repeatCustomers.data.forEach(point => {
      const month = new Date(point.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      console.log(`    ${month}: ${point.value} repeat customers`);
    });

    // 4. Seasonal Analysis
    console.log('\n🌟 Seasonal Revenue Patterns:');
    const seasonalData = await ordersTable.analytics.query({
      metric: 'sum',
      column: 'total_amount',
      groupBy: ['EXTRACT(MONTH FROM created_at) as month'],
      timeRange: '365d'
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    seasonalData.data.forEach(point => {
      const monthName = monthNames[point.month - 1];
      console.log(`    ${monthName}: $${point.value.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Advanced aggregation error:', error.message);
  }

  console.log('\n');
}

/**
 * Example 6: Custom Analytics with Complex Filters
 * Advanced filtering and custom metrics
 */
async function customFilterExamples() {
  console.log('🎯 Custom Analytics with Complex Filters');
  console.log('=' .repeat(50));

  try {
    const ordersTable = client.table('orders');

    // 1. High-value customer analysis
    console.log('💎 High-Value Customer Analysis:');
    const highValueMetrics = await ordersTable.analytics.query({
      metric: 'count',
      filters: {
        total_amount: { gte: 500 },
        customer_tier: 'premium'
      },
      groupBy: ['product_category'],
      timeRange: '90d'
    });

    console.log('  Premium orders by category (>$500):');
    highValueMetrics.data.forEach((category, index) => {
      console.log(`    ${index + 1}. ${category.product_category}: ${category.value} orders`);
    });

    // 2. Geographic performance with filters
    console.log('\n🗺️ Regional Performance (Filtered):');
    const regionalMetrics = await ordersTable.analytics.query({
      metric: 'sum',
      column: 'total_amount',
      filters: {
        created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        order_status: 'completed'
      },
      groupBy: ['shipping_country', 'shipping_region'],
      limit: 8
    });

    console.log('  Top regions (last 30d, completed orders):');
    regionalMetrics.data.forEach((region, index) => {
      console.log(`    ${index + 1}. ${region.shipping_country}/${region.shipping_region}: $${region.value.toFixed(2)}`);
    });

    // 3. Time-based filtering with custom ranges
    console.log('\n⏰ Custom Time Range Analysis:');
    
    // Business hours analysis (9 AM - 5 PM)
    const businessHoursRevenue = await ordersTable.analytics.sum('total_amount', {
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      'EXTRACT(HOUR FROM created_at)': {
        gte: 9,
        lte: 17
      }
    });

    const afterHoursRevenue = await ordersTable.analytics.sum('total_amount', {
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      'EXTRACT(HOUR FROM created_at)': {
        lt: 9,
        gt: 17
      }
    });

    console.log(`  Business Hours Revenue (9-5): $${businessHoursRevenue.toFixed(2)}`);
    console.log(`  After Hours Revenue: $${afterHoursRevenue.toFixed(2)}`);

    // 4. Complex conditional metrics
    console.log('\n🧮 Conditional Metrics:');
    
    // Average order value for different customer segments
    const segments = ['new', 'returning', 'vip'];
    
    for (const segment of segments) {
      const segmentAvg = await ordersTable.analytics.avg('total_amount', {
        customer_segment: segment,
        created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      });
      
      console.log(`  Average Order Value (${segment}): $${segmentAvg.toFixed(2)}`);
    }

    // 5. Performance comparison
    console.log('\n📊 Month-over-Month Comparison:');
    
    const thisMonth = await ordersTable.analytics.sum('total_amount', {
      created_at: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      }
    });

    const lastMonth = await ordersTable.analytics.sum('total_amount', {
      created_at: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(),
        lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      }
    });

    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 'N/A';
    
    console.log(`  This Month: $${thisMonth.toFixed(2)}`);
    console.log(`  Last Month: $${lastMonth.toFixed(2)}`);
    console.log(`  Growth: ${growth}%`);

  } catch (error) {
    console.error('❌ Custom filter analytics error:', error.message);
  }

  console.log('\n');
}

// Helper function to create demo data
async function createDemoData() {
  console.log('🔧 Setting up demo data...');
  
  try {
    // This would create sample tables and data for demonstration
    // In real usage, you'd work with your existing tables
    
    console.log('✅ Demo data setup complete');
  } catch (error) {
    console.log('⚠️ Demo data setup skipped (likely already exists)');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  // Check for API key
  if (!process.env.APPATONCE_API_KEY) {
    console.error('❌ Please set APPATONCE_API_KEY environment variable');
    process.exit(1);
  }

  main()
    .then(() => {
      console.log('✅ All analytics examples completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Examples failed:', error);
      process.exit(1);
    });
}

module.exports = {
  basicAnalyticsExamples,
  realtimeAnalyticsExample,
  timeSeriesExamples,
  businessMetricsExamples,
  advancedAggregationExamples,
  customFilterExamples
};