# MongoDB Data Model Patterns Guide

## 1. Inheritance Pattern

### Problem
Different document types share common fields but also have type-specific fields. Without structure, queries become complex and schemas are unclear.

### Solution
Use a common `type` or `category` field to differentiate documents while keeping shared fields at the root level. Type-specific fields can be embedded or kept at the same level.

### Example
```javascript
// Vehicle collection with inheritance
{
  _id: 1,
  type: "car",
  brand: "Toyota",
  model: "Camry",
  year: 2023,
  // Car-specific fields
  doors: 4,
  fuelType: "hybrid"
}

{
  _id: 2,
  type: "motorcycle",
  brand: "Harley Davidson",
  model: "Sportster",
  year: 2023,
  // Motorcycle-specific fields
  engineCC: 1200,
  hasWindshield: true
}
```

### Benefits
- Single collection for related entities
- Efficient queries using the type field
- Shared indexes work across all types
- Flexible schema per document type

### Use Cases
- Product catalogs with different product types
- Employee records (full-time, contractor, intern)
- Content management (articles, videos, podcasts)

---

## 2. Computed Pattern

### Problem
Expensive calculations performed repeatedly on the same data waste resources and slow down read operations.

### Solution
Pre-compute and store calculated values in the document. Update these values when source data changes, either through application logic or database triggers.

### Example
```javascript
// Order document with computed totals
{
  _id: 101,
  customer_id: 5001,
  items: [
    { product: "Laptop", price: 50000, quantity: 1 },
    { product: "Mouse", price: 500, quantity: 2 }
  ],
  // Computed fields
  subtotal: 51000,
  tax: 9180,        // 18% GST
  total: 60180,
  itemCount: 3,
  lastUpdated: ISODate("2024-01-15")
}
```

### Implementation Approaches
1. **Application-level**: Calculate on insert/update
2. **Aggregation pipeline**: Use `$merge` to update computed fields
3. **Change streams**: Listen for changes and update computed values
4. **Scheduled jobs**: Batch update for non-critical computations

### Benefits
- Faster read operations (no runtime calculations)
- Reduced CPU load on queries
- Simplified application logic for reads
- Better query performance

### Trade-offs
- Increased write complexity
- Potential data staleness
- Additional storage for computed values

### Use Cases
- E-commerce order totals and summaries
- User statistics (post count, follower count)
- Financial calculations (interest, balances)
- Analytics dashboards

---

## 3. Approximation Pattern

### Problem
Exact precision isn't always necessary, but tracking every single event creates massive data volumes and performance issues.

### Solution
Track approximate values by sampling, rounding, or batching updates. Accept slight inaccuracy for better performance and reduced storage.

### Example
```javascript
// Video view tracking with approximation
{
  _id: "video_abc123",
  title: "MongoDB Tutorial",
  views: 1523000,        // Rounded to nearest 1000
  lastViewUpdate: ISODate("2024-01-15T10:30:00Z"),
  preciseViews: 1523487, // Optional: store exact in less-accessed field
  
  // Update every 100 views instead of every view
  viewBatches: [
    { date: "2024-01-15", count: 100 },
    { date: "2024-01-15", count: 100 }
  ]
}
```

### Strategies
1. **Rounding**: Round numbers to nearest 10, 100, or 1000
2. **Sampling**: Only record 1 in N events
3. **Batching**: Accumulate updates and write periodically
4. **Time-based**: Update at intervals instead of real-time

### Benefits
- Reduced write operations
- Lower storage requirements
- Better write performance
- Acceptable accuracy for many use cases

### Use Cases
- Page view counters
- Video/music play counts
- Social media likes/reactions
- Real-time analytics dashboards
- IoT sensor data

---

## 4. Extended Reference Pattern

### Problem
Frequently accessed data from referenced documents requires expensive joins. Pure embedding isn't suitable when documents are large or updated independently.

### Solution
Duplicate frequently accessed fields from referenced documents into the parent document. Maintain the reference for complete data access when needed.

### Example
```javascript
// Order document with extended customer reference
{
  _id: 2001,
  orderDate: ISODate("2024-01-15"),
  status: "shipped",
  
  // Extended reference - frequently needed customer data
  customer: {
    _id: 5001,
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91-9876543210"
    // Full customer document has 20+ more fields
  },
  
  items: [...],
  total: 15000
}

// Actual customer collection has complete data
// customers collection
{
  _id: 5001,
  name: "Rajesh Kumar",
  email: "rajesh@example.com",
  phone: "+91-9876543210",
  address: {...},
  preferences: {...},
  orderHistory: [...],
  // ... many more fields
}
```

### Benefits
- Avoid expensive joins for common queries
- Faster read operations
- Reduced application complexity
- Better performance for read-heavy workloads

### Trade-offs
- Data duplication
- Update complexity (maintain consistency)
- Increased document size

### When to Use
- Fields are read frequently together
- Referenced data changes infrequently
- Join operations are performance bottleneck
- Acceptable to have slightly stale data

### Use Cases
- Order systems (extend customer/product info)
- Blog posts (extend author name, avatar)
- Social feeds (extend user profile snippets)
- Event registrations (extend event details)

---

## 5. Schema Versioning Pattern

### Problem
Schema changes over time require migrations. Running migrations on large collections is risky and causes downtime. Old and new application versions need to coexist.

### Solution
Add a version field to documents. Application handles multiple schema versions simultaneously. Migrate documents lazily or in batches.

### Example
```javascript
// Version 1 - Original schema
{
  _id: 1,
  schema_version: 1,
  name: "John Doe",
  phone: "9876543210"
}

// Version 2 - Phone becomes object
{
  _id: 2,
  schema_version: 2,
  name: "Jane Smith",
  phone: {
    country_code: "+91",
    number: "9876543210",
    type: "mobile"
  }
}

// Version 3 - Added email field
{
  _id: 3,
  schema_version: 3,
  name: "Bob Wilson",
  phone: {
    country_code: "+1",
    number: "5551234567",
    type: "mobile"
  },
  email: "bob@example.com"
}
```

### Implementation Strategy
```javascript
// Application code handles multiple versions
function getPhone(user) {
  switch(user.schema_version) {
    case 1:
      return { number: user.phone, country_code: "+91" };
    case 2:
    case 3:
      return user.phone;
    default:
      return user.phone;
  }
}

// Lazy migration on write
function updateUser(userId, updates) {
  const user = db.users.findOne({ _id: userId });
  
  // Migrate to latest version if needed
  if (user.schema_version < CURRENT_VERSION) {
    migrateUser(user);
  }
  
  // Apply updates
  db.users.updateOne(
    { _id: userId },
    { $set: { ...updates, schema_version: CURRENT_VERSION } }
  );
}
```

### Migration Approaches
1. **Lazy Migration**: Update during next write operation
2. **Batch Migration**: Process documents in background
3. **Hybrid**: Migrate critical docs immediately, others lazily
4. **Read-time Migration**: Transform data when reading

### Benefits
- Zero-downtime deployments
- Gradual schema evolution
- Version rollback capability
- Support for A/B testing
- Safe migrations

### Best Practices
- Always include `schema_version` field
- Document version differences clearly
- Test with multiple versions
- Monitor version distribution
- Set migration timeline

### Use Cases
- Applications with frequent schema changes
- Multi-tenant systems with different update schedules
- Mobile apps with various client versions
- Microservices with independent deployment cycles

---

## Pattern Selection Guide

| Pattern | Best For | Avoid When |
|---------|----------|------------|
| **Inheritance** | Multiple entity types in one collection | Types have vastly different fields |
| **Computed** | Expensive calculations done repeatedly | Source data changes very frequently |
| **Approximation** | High-volume, low-precision requirements | Exact accuracy is critical |
| **Extended Reference** | Frequently accessed referenced data | Referenced data changes often |
| **Schema Versioning** | Evolving schemas, zero-downtime needs | Schema is completely stable |

---

## Combining Patterns

These patterns work well together:

- **Inheritance + Schema Versioning**: Different entity types evolving independently
- **Extended Reference + Computed**: Cache referenced data and pre-calculate values
- **Approximation + Computed**: Approximate input, compute summary statistics
- **Schema Versioning + Any Pattern**: Always useful for production systems

---

## Key Takeaways

1. **No one-size-fits-all**: Choose patterns based on your specific access patterns
2. **Trade-offs matter**: Balance between read/write performance, storage, and complexity
3. **Measure first**: Profile queries before optimizing
4. **Start simple**: Add patterns as needs emerge
5. **Document decisions**: Make patterns explicit in code and documentation