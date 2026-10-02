Có **2 lỗi riêng biệt**:

## 1. Tìm người chat không ra
Backend hiện tại đã đổi route tìm nhân viên thành:  GET /api/v1/employees/search?search=abc  Trong `EmployeeSearchController.cs`.

Frontend phải sửa: async searchEmployees(search: string) {
  const response = await this.http.get(
    "/api/v1/employees/search",
    {
      params: { search },
    }
  );

  return response.data.value;
}  Không dùng route cũ: /api/v1/employees 

 Route đó thuộc API quản lý nhân viên trong `EmployeeController`, không phải search chat.  Khi click kết quả, phải truyền:  await chatService.createDirect(employee.userId);  Không truyền: employee.id
employee.username
employee.employeeCode ## 2. Tin nhắn không load
Backend route lấy tin nhắn vẫn đúng:  GET /api/v1/conversations/{conversationId}/messages?limit=30  x.ConversationId == conversationId
&& x.SentAt >= joinedAt.Value  và member phải thỏa:

    x.ConversationId == conversationId
&& x.UserId == userId
&& x.IsActive Trong `ChatRepository.cs`.

Frontend phải đọc response như sau:  async getMessages(conversationId: string) {
  const response = await this.http.get(
    `/api/v1/conversations/${conversationId}/messages`,
    {
      params: {
        limit: 30,
      },
    }
  );

  return response.data.value; 
} Không đọc:  response.data.data  Vì API chat trả:  {
  "isSuccess": true,
  "isFailure": false,
  "value": []
}  ## 3. Thứ tự mở conversation phải là  const conversation =
  await chatService.createDirect(employee.userId);

await reloadConversations();

const messages =
  await chatService.getMessages(conversation.id);

setSelectedConversationId(conversation.id);
setSelectedConversation(conversation);
setMessages(messages);

await connection.invoke(
  "JoinConversation",
  conversation.id ## 4. Kiểm tra nhanh trong Network
  Frontend cần có các request sau:  GET  /api/v1/employees/search?search=...
POST /api/v1/conversations/direct
GET  /api/v1/conversations
GET  /api/v1/conversations/{conversationId}/messages 
);   Tất cả request phải có:  Authorization: Bearer <access_token>  ## 5. Lưu ý về lịch sử cũ
Backend hiện cố ý chỉ trả tin nhắn từ thời điểm member tham gia:  x.SentAt >= JoinedAt  Nếu tin nhắn cũ hơn `JoinedAt`, backend sẽ không trả. Đây là rule hiện tại trong domain.

Build backend hiện vẫn thành công. Lỗi tìm user gần như chắc chắn là frontend còn gọi route cũ; lỗi không load tin nhắn cần kiểm tra thêm response thực tế là `value: []` hay HTTP `500`.