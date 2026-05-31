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

  late TextEditingController _departmentIdController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user['name']);
    _emailController = TextEditingController(text: widget.user['email']);
    _departmentIdController = TextEditingController(
      text: widget.user['DepartmentId'] != null ? widget.user['DepartmentId'].toString() : '',
    );
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
      final deptId = int.tryParse(_departmentIdController.text.trim());
      final data = await ApiService.updateUser(
        widget.user['id'],
        _nameController.text.trim(),
        _emailController.text.trim(),
        _passwordController.text,
        DepartmentId: deptId,
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
            TextField(
              controller: _departmentIdController,
              decoration: const InputDecoration(labelText: 'ID Departemen'),
              keyboardType: TextInputType.number,
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
