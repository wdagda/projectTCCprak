import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://34.128.121.83:3001/api';

  static Future<Map<String, String>> _getHeaders() async {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Connection': 'close',
    };
  }

  // Auth Methods
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: await _getHeaders(),
      body: jsonEncode({'email': email, 'password': password}),
    ).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  static Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password, {
    int? DepartmentId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        if (DepartmentId != null) 'DepartmentId': DepartmentId,
      }),
    ).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  static Future<List<dynamic>> getDepartments() async {
    final response = await http.get(
      Uri.parse('$baseUrl/departments'),
      headers: await _getHeaders(),
    ).timeout(const Duration(seconds: 10));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load departments');
    }
  }

  static Future<List<dynamic>> getCategories() async {
    final response = await http.get(
      Uri.parse('$baseUrl/categories'),
      headers: await _getHeaders(),
    ).timeout(const Duration(seconds: 10));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load categories');
    }
  }

  static Future<List<dynamic>> getAssets() async {
    final response = await http.get(
      Uri.parse('$baseUrl/assets'),
      headers: await _getHeaders(),
    ).timeout(const Duration(seconds: 10));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load assets');
    }
  }

  static Future<Map<String, dynamic>> requestBorrowing(int userId, int assetId, [String? returnDate]) async {
    final response = await http.post(
      Uri.parse('$baseUrl/borrowings'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'user_id': userId,
        'asset_id': assetId,
        if (returnDate != null) 'return_date': returnDate,
      }),
    ).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  static Future<Map<String, dynamic>> updateUser(
    int id,
    String name,
    String email,
    String password, {
    int? DepartmentId,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/users/$id'),
      headers: await _getHeaders(),
      body: jsonEncode({
        if (name.isNotEmpty) 'name': name,
        if (email.isNotEmpty) 'email': email,
        if (password.isNotEmpty) 'password': password,
        if (DepartmentId != null) 'DepartmentId': DepartmentId,
      }),
    ).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  // Borrowing Methods
  static Future<List<dynamic>> getUserBorrowings(int userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/borrowings/user/$userId'),
      headers: await _getHeaders(),
    ).timeout(const Duration(seconds: 10));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load borrowings');
    }
  }

  static Future<Map<String, dynamic>> updateBorrowingStatus(
    int id,
    String status,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/borrowings/$id/status'),
      headers: await _getHeaders(),
      body: jsonEncode({'status': status}),
    ).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  static Future<Map<String, dynamic>> confirmHandover(int id) async {
    final response = await http.post(
      Uri.parse('$baseUrl/borrowings/$id/handover'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'terms_agreed': true,
        'signature_url': '/dummy-signature.png',
      }),
    ).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  static Map<String, dynamic> _processResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      final decoded = jsonDecode(response.body);
      throw Exception(decoded['error'] ?? 'An error occurred');
    }
  }

  // Session Management
  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('appUser', jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('appUser');
    if (userStr != null) {
      return jsonDecode(userStr);
    }
    return null;
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('appUser');
  }
}
