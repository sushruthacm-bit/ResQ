# ResQ API Documentation

Base URL: `http://localhost:3000/api`

All responses follow the shape:
```json
{ "success": true, "data": { ... } }
```
or on error:
```json
{ "success": false, "error": { "message": "..." } }
```

---

## 1. Create Emergency Request

**POST** `/emergencies`

Classifies the emergency (AI or rule-based), persists it, and adds it to the Redis priority queue.

**Request body**
```json
{
  "user_id": 1,
  "latitude": 12.9,
  "longitude": 77.6,
  "description": "There is a fire in the kitchen and smoke is filling the house"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 7,
    "user_id": 1,
    "latitude": "12.9000000",
    "longitude": "77.6000000",
    "description": "There is a fire in the kitchen and smoke is filling the house",
    "category": "Fire",
    "priority": "high",
    "recommended_responder": "Firefighter",
    "classification_source": "rule_engine",
    "confidence": 1,
    "reasoning": "Matched keyword \"fire\" for category Fire",
    "status": "pending",
    "estimated_response_time": 10,
    "created_at": "2026-08-01T00:56:09.234Z",
    "updated_at": "2026-08-01T00:56:09.234Z"
  }
}
```

> `confidence`, `reasoning`, and `estimated_response_time` are new fields added on top of the original response — nothing existing was removed or renamed.

---

## 2. Get Pending Requests

**GET** `/emergencies/pending`

Returns pending emergencies fetched from the Redis priority queue (highest priority first), then hydrated from PostgreSQL.

**Response** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": [ { "id": 7, "priority": "high", "status": "pending", "...": "..." } ]
}
```

---

## 3. Assign Responder (Manual)

**POST** `/responders/assign`

Manually assigns a specific responder to a specific emergency.

**Request body**
```json
{ "request_id": 7, "responder_id": 2 }
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "request_id": 7,
    "responder_id": 2,
    "assigned_at": "2026-08-01T01:11:24.476Z",
    "notes": null
  }
}
```

---

## 3b. Assign Responder (Automatic — New Feature)

**POST** `/responders/auto-assign`

Finds the nearest available responder whose `type` matches the emergency's `recommended_responder`, using Haversine distance on latitude/longitude, and assigns them automatically. Internally reuses the same assignment logic as the manual endpoint above, so behavior (DB updates, Redis dequeue, event emission, logging) stays identical.

**Request body**
```json
{ "request_id": 7 }
```

**Response** `201 Created` — same shape as manual assignment above.

**Error** `404` if no available responder of the matching type exists.

---

## 4. Update Request Status

**PATCH** `/emergencies/:id/status`

Updates status, records the change in `status_history`, and emits a `status:updated` event.

**Request body**
```json
{ "status": "resolved", "changed_by": 1 }
```
Valid `status` values: `pending`, `assigned`, `in_progress`, `resolved`, `cancelled`

**Response** `200 OK`
```json
{
  "success": true,
  "data": { "id": 7, "status": "resolved", "...": "..." }
}
```

---

## 5. Get Active Requests

**GET** `/emergencies/active`

Returns all non-resolved, non-cancelled emergencies from PostgreSQL.

**Response** `200 OK`
```json
{ "success": true, "count": 3, "data": [ { "...": "..." } ] }
```

---

## 5b. Get Emergency Timeline (New Feature)

**GET** `/emergencies/:id/timeline`

Returns the full status-change history of an emergency in chronological order — built from the existing `status_history` table, exposed as a new read-only endpoint.

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "request_id": 7,
    "current_status": "resolved",
    "timeline": [
      {
        "old_status": "assigned",
        "new_status": "resolved",
        "changed_by": 1,
        "changed_at": "2026-08-01T01:18:16.144Z"
      }
    ]
  }
}
```

---

## 6. Dispatch Notification

**POST** `/dispatch/notify`

Simulates notifying a responder via the event-driven mechanism (`dispatch:notified` event), and persists a log entry.

**Request body**
```json
{ "request_id": 7 }
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Dispatch notification sent",
    "request_id": 7,
    "category": "Fire",
    "priority": "high",
    "location": { "latitude": 12.9, "longitude": 77.6 },
    "notified_at": "2026-08-01T01:20:00.000Z"
  }
}
```

---

## 7. AI Priority Classification

**POST** `/ai/classify`

Classifies a raw description using Groq AI, falling back to a keyword-based rule engine on failure. Now includes confidence and reasoning (new feature).

**Request body**
```json
{ "description": "There is a fire in the kitchen and smoke is filling the house." }
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "category": "Fire",
    "priority": "high",
    "recommended_responder": "Firefighter",
    "source": "rule_engine",
    "confidence": 1,
    "reasoning": "Matched keyword \"fire\" for category Fire"
  }
}
```

---

## 8. Get All Responders

**GET** `/responders`

**Response** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Unit Alpha – Paramedic",
      "type": "Paramedic",
      "phone": "+1-555-0201",
      "status": "available",
      "latitude": "40.7128000",
      "longitude": "-74.0060000"
    }
  ]
}
```

---

## Error Response Format

All errors follow:
```json
{ "success": false, "error": { "message": "Emergency request not found" } }
```
Common status codes: `400` (validation), `404` (not found), `500` (server error).
