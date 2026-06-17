import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../models/contact_model.dart';
import '../../providers/contact_provider.dart';

class ContactDetailScreen extends StatefulWidget {
  const ContactDetailScreen({super.key, required this.contactId});

  final int contactId;

  @override
  State<ContactDetailScreen> createState() => _ContactDetailScreenState();
}

class _ContactDetailScreenState extends State<ContactDetailScreen> {
  ContactModel? _contact;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadContact());
  }

  void _loadContact() {
    final contact = context
        .read<ContactProvider>()
        .contacts
        .where((c) => c.id == widget.contactId)
        .firstOrNull;
    if (contact != null) setState(() => _contact = contact);
  }

  Future<void> _handleDelete() async {
    if (_contact == null) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Message'),
        content: const Text('Delete this message? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.accent),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await context.read<ContactProvider>().deleteContact(_contact!);
      if (mounted) context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_contact == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Message')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Message Detail'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: _handleDelete,
            tooltip: 'Delete',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: _buildMessageCard(_contact!),
      ),
    );
  }

  Widget _buildMessageCard(ContactModel contact) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            contact.name,
            style: const TextStyle(
              color: AppColors.dark,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            contact.email,
            style: const TextStyle(color: AppColors.accent, fontSize: 13),
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.border),
          const SizedBox(height: 12),
          const Text(
            'Subject',
            style: TextStyle(
              color: AppColors.muted,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            contact.subject,
            style: const TextStyle(
              color: AppColors.dark,
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Message',
            style: TextStyle(
              color: AppColors.muted,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            contact.message,
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 14,
              height: 1.6,
            ),
          ),
          if (contact.createdAt.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'Received: ${_formatDate(contact.createdAt)}',
              style: const TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final dt = DateTime.parse(dateStr);
      return '${dt.day}/${dt.month}/${dt.year} at '
          '${dt.hour.toString().padLeft(2, '0')}:'
          '${dt.minute.toString().padLeft(2, '0')}';
    } on Exception {
      return dateStr;
    }
  }
}
