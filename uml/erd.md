erDiagram
  USERS {
    ObjectId _id PK
    string name
    string email "unique"
    string password "bcrypt"
    string role "user|admin"
    boolean isActive
    Date createdAt
    Date updatedAt
  }
  CATEGORIES {
    ObjectId _id PK
    ObjectId userId FK
    string name
    string color "hex"
    Date createdAt
  }
  REMINDERS {
    ObjectId _id PK
    ObjectId userId FK
    ObjectId categoryId FK
    string title
    string description
    Date deadline
    Date reminderTime
    string priority "Low|Medium|High"
    string status "TODO|IN_PROGRESS|DONE"
    Date completedAt
    boolean isNotified
    Date createdAt
    Date updatedAt
  }
  NOTIFICATIONS {
    ObjectId _id PK
    ObjectId userId FK
    ObjectId reminderId FK
    string message
    boolean isRead
    string channel "ui|email"
    int retryCount
    Date sentAt
    Date createdAt
  }
  AUDIT_LOGS {
    ObjectId _id PK
    ObjectId userId FK
    string action
    string targetModel
    ObjectId targetId
    object changes
    string ip
    Date createdAt
  }

  USERS ||--o{ REMINDERS : "owns"
  USERS ||--o{ CATEGORIES : "creates"
  USERS ||--o{ NOTIFICATIONS : "receives"
  USERS ||--o{ AUDIT_LOGS : "generates"
  CATEGORIES ||--o{ REMINDERS : "groups"
  REMINDERS ||--o{ NOTIFICATIONS : "triggers"