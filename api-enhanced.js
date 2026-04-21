/* ============================================================
   EYLOX — Enhanced API Client (Phase 1+)
   Extends the base API client with new features:
   - Ratings
   - Leaderboards
   - Achievements
   - Messages
   - Communities
   - Notifications
   ============================================================ */

/* ── Ratings ── */
const Ratings = {
  async getGameRatings(gameId, page = 1, sort = 'newest') {
    return request('GET', `/ratings/game/${gameId}?page=${page}&sort=${sort}`);
  },

  async rateGame(gameId, rating, comment = '') {
    return request('POST', `/ratings/game/${gameId}`, { rating, comment }, true);
  },

  async getMyRating(gameId) {
    return request('GET', `/ratings/game/${gameId}/my-rating`, null, true);
  },

  async markHelpful(ratingId) {
    return request('POST', `/ratings/${ratingId}/helpful`, null, true);
  },

  async deleteRating(ratingId) {
    return request('DELETE', `/ratings/${ratingId}`, null, true);
  },
};

/* ── Leaderboards ── */
const Leaderboards = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/leaderboards${qs ? '?' + qs : ''}`);
  },

  async get(id) {
    return request('GET', `/leaderboards/${id}`);
  },

  async getByCategory(category, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/leaderboards/type/${category}${qs ? '?' + qs : ''}`);
  },

  async getPlayerRank(userId, category, game = null) {
    const query = `?category=${category}${game ? '&game=' + game : ''}`;
    return request('GET', `/leaderboards/rank/${userId}${query}`, null, true);
  },

  async create(season, category, game = null, genre = null) {
    return request('POST', '/leaderboards', { season, category, game, genre }, true);
  },

  async updateEntries(id, entries) {
    return request('PUT', `/leaderboards/${id}/update-entries`, { entries }, true);
  },

  async endSeason(id) {
    return request('POST', `/leaderboards/${id}/end-season`, null, true);
  },
};

/* ── Achievements ── */
const Achievements = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/achievements${qs ? '?' + qs : ''}`);
  },

  async get(code) {
    return request('GET', `/achievements/${code}`);
  },

  async unlock(code) {
    return request('POST', `/achievements/${code}/unlock`, null, true);
  },

  async getUserAchievements(userId) {
    return request('GET', `/achievements/user/${userId}`);
  },

  async create(code, name, description, icon, rarity, criteria, reward) {
    return request('POST', '/achievements', 
      { code, name, description, icon, rarity, criteria, reward }, true);
  },

  async update(code, updates) {
    return request('PUT', `/achievements/${code}`, updates, true);
  },
};

/* ── Messages (Direct Messages) ── */
const Messages = {
  async getConversation(userId, page = 1) {
    return request('GET', `/messages/conversation/${userId}?page=${page}`, null, true);
  },

  async getConversations() {
    return request('GET', '/messages/conversations/list', null, true);
  },

  async send(recipientId, content) {
    return request('POST', '/messages/send', { recipientId, content }, true);
  },

  async edit(messageId, content) {
    return request('PUT', `/messages/${messageId}`, { content }, true);
  },

  async delete(messageId) {
    return request('DELETE', `/messages/${messageId}`, null, true);
  },

  async getUnreadCount() {
    return request('GET', '/messages/unread/count', null, true);
  },
};

/* ── Communities ── */
const Communities = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/communities${qs ? '?' + qs : ''}`);
  },

  async get(id) {
    return request('GET', `/communities/${id}`);
  },

  async create(name, description, category, avatar = '🎮', rules = '') {
    return request('POST', '/communities', 
      { name, description, category, avatar, rules }, true);
  },

  async update(id, updates) {
    return request('PUT', `/communities/${id}`, updates, true);
  },

  async join(id) {
    return request('POST', `/communities/${id}/join`, null, true);
  },

  async leave(id) {
    return request('POST', `/communities/${id}/leave`, null, true);
  },

  async getUserCommunities(userId) {
    return request('GET', `/communities/user/${userId}`);
  },

  async delete(id) {
    return request('DELETE', `/communities/${id}`, null, true);
  },
};

/* ── Notifications ── */
const Notifications = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/notifications${qs ? '?' + qs : ''}`);
  },

  async getUnreadCount() {
    return request('GET', '/notifications/unread-count', null, true);
  },

  async markAsRead(id) {
    return request('PUT', `/notifications/${id}/read`, null, true);
  },

  async markAllAsRead() {
    return request('PUT', '/notifications/all/read', null, true);
  },

  async delete(id) {
    return request('DELETE', `/notifications/${id}`, null, true);
  },

  async deleteAll() {
    return request('DELETE', '/notifications', null, true);
  },
};

/* ── Marketplace ── */
const Marketplace = {
  async getItems(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/marketplace/items${qs ? '?' + qs : ''}`);
  },

  async getFeatured() {
    return request('GET', '/marketplace/items/featured');
  },

  async getItem(id) {
    return request('GET', `/marketplace/items/${id}`);
  },

  async getInventory() {
    return request('GET', '/marketplace/inventory', null, true);
  },

  async buy(itemId) {
    return request('POST', `/marketplace/items/${itemId}/buy`, null, true);
  },

  async createItem(itemData) {
    return request('POST', '/marketplace/items', itemData, true);
  },

  async updateItem(id, updates) {
    return request('PUT', `/marketplace/items/${id}`, updates, true);
  },

  async getCreatorItems() {
    return request('GET', '/marketplace/creator/items', null, true);
  },

  async getItemStats(id) {
    return request('GET', `/marketplace/items/${id}/stats`, null, true);
  },
};

/* ── Trading ── */
const Trading = {
  async getMyTrades(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/trades${qs ? '?' + qs : ''}`, null, true);
  },

  async getPendingTrades() {
    return request('GET', '/trades/pending', null, true);
  },

  async createTrade(toUserId, fromItems = [], toItems = [], coinsFrom = 0, coinsTo = 0) {
    return request('POST', '/trades', { toUserId, fromItems, toItems, coinsFrom, coinsTo }, true);
  },

  async acceptTrade(tradeId) {
    return request('POST', `/trades/${tradeId}/accept`, null, true);
  },

  async declineTrade(tradeId) {
    return request('POST', `/trades/${tradeId}/decline`, null, true);
  },

  async cancelTrade(tradeId) {
    return request('DELETE', `/trades/${tradeId}`, null, true);
  },
};

/* ── Extended Users (Phase 1+) ── */
const UsersExtended = {
  async updateProfile(userId, updates) {
    // updates can include: bio, banner, location, website, theme, notifications, privacy
    return request('PUT', `/users/${userId}`, updates, true);
  },

  async follow(userId) {
    return request('POST', `/users/${userId}/follow`, null, true);
  },

  async unfollow(userId) {
    return request('POST', `/users/${userId}/unfollow`, null, true);
  },

  async block(userId) {
    return request('POST', `/users/${userId}/block`, null, true);
  },

  async getFollowers(userId) {
    return request('GET', `/users/${userId}/followers`);
  },
};

/* ── Extended Games (Phase 1+) ── */
const GamesExtended = {
  async publish(gameData) {
    return request('POST', '/games', gameData, true);
  },

  async update(id, gameData) {
    return request('PUT', `/games/${id}`, gameData, true);
  },

  async delete(id) {
    return request('DELETE', `/games/${id}`, null, true);
  },

  async unlike(id) {
    return request('DELETE', `/games/${id}/like`, null, true);
  },
};

console.log('✅ Enhanced API Client loaded with Phase 1+ features');
