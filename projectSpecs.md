# CartMate - Simple Collaborative Shopping App

**"Shopping Lists Meet WhatsApp"**

## 🎯 App Vision

A simple shopping list app where users can create private or shared lists, invite friends to collaborate, chat about items, and check things off together in real-time. Each list is completely isolated like WhatsApp groups.

## ✨ Core Features (Keep It Simple)

### 1. **Shopping Lists**

- Create shopping lists with a name
- **Choose privacy**: Keep private OR share with friends
- Share lists via invite links (only for shared lists)
- Real-time collaboration (everyone sees changes instantly)
- **Complete isolation**: Each list is like a separate WhatsApp group

### 2. **List Items**

- **Name** (required) - "Milk"
- **Quantity** (required) - "2 bottles"
- **Description** (optional) - "2% fat"
- **Category** (optional) - "Dairy", "Produce", etc.
- **Added by** - Show who added each item
- **Completed by** - Show who checked off each item
- Anyone can check off items

### 3. **Group Chat** (Shared Lists Only)

- Chat about the shopping list
- Discuss specific items
- Real-time messaging like WhatsApp
- See who's online in THIS list only

### 4. **Simple Collaboration** (Shared Lists)

- Anyone in the list can:
  - Add new items
  - Edit existing items
  - Check off completed items
  - Chat with the group

### 5. **Complete List Isolation** 🔒

- Like WhatsApp groups - no cross-list visibility
- Members only see who's in THAT specific list
- No way to discover what other lists someone belongs to
- Your participation in other lists stays private

## 🗺️ User Flow

```
1. Create Account → 2. Create List → 3. Choose Private/Shared → 4. Collaborate!
```

### Detailed Flow:

```
📱 User Journey:
├── 🚀 Sign up/Login
├── ➕ Create "Grocery Shopping" list
├── 🔒 Choose: Private OR Shared
├── 📤 IF Shared: Share invite link with friends
├── 👥 Friends join the list (isolated group)
├── 🛒 Everyone adds items with quantities
├── 💬 Chat: "Do we need 2 or 3 apples?"
├── ✅ Check off items (see who completed what)
└── 🎉 Shopping complete!
```

## 📱 App Structure

### **3 Main Screens:**

#### 1. **My Lists** (Home)

- See all your shopping lists (private + shared)
- Create new list button
- Join list via invite link

#### 2. **List View**

- **Private Lists**: Just items, no chat
- **Shared Lists**: Split screen with items + chat

#### 3. **Profile**

- Your name and settings
- Notification preferences

## 🎨 Simple UI Design

### **Shared List View Layout:**

```
┌─────────────────────────────────┐
│  🍎 Grocery Shopping     👥 3   │ ← Header
├─────────────────┬───────────────┤
│ SHOPPING ITEMS  │     CHAT      │
│                 │               │
│ ☐ Milk (2)      │ John: Got it! │
│   Added by John │ You: Thanks   │
│ ☑ Bread (1)     │ Mary: Need    │
│   ✓ by Mary     │  anything     │
│ ☐ Eggs (12)     │  else?        │
│   Added by You  │               │
├─────────────────┼───────────────┤
│ + Add item...   │ Type message  │ ← Input bars
└─────────────────┴───────────────┘
```

### **Private List View Layout:**

```
┌─────────────────────────────────┐
│  🏠 Personal Shopping    🔒     │ ← Header
├─────────────────────────────────┤
│         SHOPPING ITEMS          │
│                                 │
│ ☐ Milk (2 bottles)              │
│ ☐ Bread (1 loaf)                │
│ ☑ Apples (5)                    │
│   ✓ Completed                   │
│ ☐ Eggs (1 dozen)                │
│                                 │
│                                 │
├─────────────────────────────────┤
│ + Add item...                   │ ← Input bar
└─────────────────────────────────┘
```

## 🛠️ Tech Stack (Simplified)

### **Frontend:**

- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **framer motion** for animations

### **Backend:**

- **Neon PostgreSQL** database
- **Prisma** ORM
- **Socket.io** for real-time features

### **Authentication:**

- **Clerk** for user management

### **Real-time:**

- **Socket.io** for live updates and chat

## 🗄️ Database Schema (Updated)

```prisma
model User {
  id          String @id @default(cuid())
  clerkUserId String @unique
  email       String
  name        String
  createdAt   DateTime @default(now())

  // Relations
  ownedLists     ShoppingList[] @relation("ListOwner")
  listMembers    ListMember[]
  addedItems     Item[] @relation("ItemAdder")
  completedItems Item[] @relation("ItemCompleter")
  chatMessages   ChatMessage[]
}

model ShoppingList {
  id         String @id @default(cuid())
  name       String
  ownerId    String
  isShared   Boolean @default(false)  // NEW: Private vs Shared
  inviteCode String? @unique          // Only for shared lists
  createdAt  DateTime @default(now())

  // Relations
  owner        User @relation("ListOwner", fields: [ownerId], references: [id])
  members      ListMember[]  // Empty for private lists
  items        Item[]
  chatMessages ChatMessage[] // Empty for private lists
}

model ListMember {
  id       String @id @default(cuid())
  listId   String
  userId   String
  joinedAt DateTime @default(now())

  // Relations
  list ShoppingList @relation(fields: [listId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@unique([listId, userId])
}

model Item {
  id            String @id @default(cuid())
  listId        String
  name          String
  quantity      String           // NEW: Required field
  description   String?
  category      String?
  isCompleted   Boolean @default(false)
  addedById     String
  completedById String?          // NEW: Track who completed
  createdAt     DateTime @default(now())
  completedAt   DateTime?        // NEW: When completed

  // Relations
  list        ShoppingList @relation(fields: [listId], references: [id])
  addedBy     User @relation("ItemAdder", fields: [addedById], references: [id])
  completedBy User? @relation("ItemCompleter", fields: [completedById], references: [id])
}

model ChatMessage {
  id        String @id @default(cuid())
  listId    String
  userId    String
  message   String
  createdAt DateTime @default(now())

  // Relations
  list ShoppingList @relation(fields: [listId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
```

## 🔌 API Routes (Updated)

```
Lists:
├── GET /api/lists              → Get my lists (private + shared)
├── POST /api/lists             → Create new list (private/shared)
├── GET /api/lists/[id]         → Get list details
├── PUT /api/lists/[id]/share   → Convert private → shared
└── POST /api/lists/join        → Join shared list via invite code

Items:
├── GET /api/items?listId=x         → Get list items
├── POST /api/items                 → Add new item (name + quantity)
├── PUT /api/items/[id]             → Edit item
├── DELETE /api/items/[id]          → Delete item
└── POST /api/items/[id]/toggle     → Check/uncheck (track who completed)

Chat: (Shared lists only)
├── GET /api/chat?listId=x  → Get chat messages
└── POST /api/chat          → Send message

Members: (Shared lists only)
└── GET /api/members?listId=x → Get list members (isolated to this list)
```

## ⚡ Real-time Features

### **Socket.io Events:**

```javascript
// Join list room (only for shared lists)
socket.emit('join-list', listId)

// Live updates
socket.on('item-added', (item) => {...})
socket.on('item-updated', (item) => {...})
socket.on('item-toggled', (itemId, isCompleted, completedBy) => {...})
socket.on('new-message', (message) => {...})  // Shared lists only
socket.on('user-joined', (user) => {...})     // Shared lists only
```

## 🔒 Privacy & Isolation Rules

### **Complete List Isolation:**

- Each shared list = separate WhatsApp group
- Members can only see:
  - Who's in THIS specific list
  - Activities in THIS list only
- **Cannot see:**
  - What other lists someone belongs to
  - Activities from other lists
  - Cross-list information

### **Example Scenario:**

```
User B creates:
├── "Grocery List" (A, C in it)
└── "Party Planning" (A, D in it)

What each person sees:
├── User A: Knows they're in both lists
├── User B: Sees all (creator)
├── User C: Only sees "Grocery List" members (A, B, C)
└── User D: Only sees "Party Planning" members (A, B, D)

C and D have NO IDEA the other exists!
```

## 🎯 MVP Features Priority

### **Phase 1 (Core MVP):**

✅ Create private/shared lists  
✅ Add items with quantity  
✅ Check off items (track who completed)  
✅ Real-time sync for shared lists  
✅ Basic chat for shared lists  
✅ Complete list isolation

### **Phase 2 (Nice to Have):**

- Categories for items
- See who's online (per list)
- Typing indicators
- Item descriptions

## 🎨 Categories (Optional)

```javascript
const CATEGORIES = [
  "🥬 Produce",
  "🥛 Dairy",
  "🍖 Meat",
  "🥫 Pantry",
  "🧻 Household",
  "🧴 Personal Care",
  "📦 Other",
];
```

## 🎨 Item Display Format

```
☐ Milk (2 bottles)
  Added by John

☑ Bread (1 loaf)
  ✓ Completed by Mary

☐ Apples (5)
  Added by You
```
