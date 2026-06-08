import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  final Map<String, dynamic> user;

  const ProfileScreen({super.key, required this.user});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  int? _selectedDepartmentId;
  List<dynamic> _departments = [];
  bool _isFetchingDepartments = true;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user['name']);
    _emailController = TextEditingController(text: widget.user['email']);
    _selectedDepartmentId = widget.user['DepartmentId'];
    _fetchDepartments();
  }

  Future<void> _fetchDepartments() async {
    setState(() => _isFetchingDepartments = true);
    try {
      final depts = await ApiService.getDepartments();
      setState(() {
        _departments = depts;
        // Verify if selected ID still exists in the fetched list
        if (_selectedDepartmentId != null) {
          final exists = depts.any((d) => d['id'] == _selectedDepartmentId);
          if (!exists) _selectedDepartmentId = null;
        }
      });
    } catch (e) {
      debugPrint('Failed to fetch departments: $e');
    } finally {
      setState(() => _isFetchingDepartments = false);
    }
  }

  String _getInitials(String name) {
    List<String> names = name.trim().split(' ');
    if (names.isEmpty) return '??';
    if (names.length == 1) return names[0][0].toUpperCase();
    return '${names[0][0]}${names.last[0]}'.toUpperCase();
  }

  Future<void> _updateProfile() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.updateUser(
        widget.user['id'],
        _nameController.text.trim(),
        _emailController.text.trim(),
        _passwordController.text,
        DepartmentId: _selectedDepartmentId,
      );
      
      final updatedUser = data['user'];
      await ApiService.saveUser(updatedUser);
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profil berhasil diperbarui!')),
      );
      Navigator.pop(context, updatedUser);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profil'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            CircleAvatar(
              radius: 50,
              backgroundColor: Theme.of(context).colorScheme.primary,
              child: Text(
                _getInitials(_nameController.text),
                style: const TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Nama Lengkap'),
              onChanged: (val) => setState(() {}), // Update initials live
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            _isFetchingDepartments
                ? const Center(child: CircularProgressIndicator())
                : DropdownButtonFormField<int>(
                    value: _selectedDepartmentId,
                    decoration: const InputDecoration(labelText: 'Departemen'),
                    items: [
                      const DropdownMenuItem<int>(
                        value: null,
                        child: Text('-- Pilih Departemen --'),
                      ),
                      ..._departments.map<DropdownMenuItem<int>>((dept) {
                        return DropdownMenuItem<int>(
                          value: dept['id'],
                          child: Text(dept['name']),
                        );
                      }),
                    ],
                    onChanged: (val) {
                      setState(() {
                        _selectedDepartmentId = val;
                      });
                    },
                  ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: 'Password Baru (Kosongkan jika tidak diubah)',
              ),
              obscureText: true,
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _updateProfile,
                child: _isLoading
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Simpan Perubahan'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
