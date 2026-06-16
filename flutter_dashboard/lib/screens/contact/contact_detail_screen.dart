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
  final _replyController = TextEditingController();
  ContactModel? _contact;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadContact());
  }

  void _loadContact() {
    final provider = context.read<ContactProvider>();
    final contact = provider.contacts
        .where((c) => c.id == widget.contactId)
        .firstOrNull;
    if (contact != null) {
      setState(() {
        _contact = contact;
        if (contact.reply != null && contact.reply!.isNotEmpty) {
          _replyController.text = contact.reply!;
        }
      });
    }
  }

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  Future<void> _handleReply() async {
    if (_contact == null) return;
    final reply = _replyController.text.trim();
    if (reply.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reply cannot be empty')),
      );
      return;
    }

    final provider = context.read<ContactProvider>();
    final success = await provider.replyContact(_contact!, reply);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Reply sent successfully')),
        );
        setState(() {
          _contact = _contact!.copyWith(
            reply: reply,
            repliedAt: DateTime.now().toIso8601String(),
          );
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(provider.errorMessage ?? 'Failed to send reply'),
          ),
        );
      }
    }
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

    final contact = _contact!;
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildMessageCard(contact),
            const SizedBox(height: 24),
            _buildReplySection(contact),
          ],
        ),
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
          Row(
            children: [
              Expanded(
                child: Text(
                  contact.name,
                  style: const TextStyle(
                    color: AppColors.dark,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              _buildStatusBadge(contact.isReplied),
            ],
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

  Widget _buildReplySection(ContactModel contact) {
    return Consumer<ContactProvider>(
      builder: (context, provider, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.reply, color: AppColors.accent, size: 18),
              const SizedBox(width: 8),
              const Text(
                'Reply',
                style: TextStyle(
                  color: AppColors.dark,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (contact.isReplied) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.success.withAlpha(26),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Sent',
                    style: TextStyle(color: AppColors.success, fontSize: 11),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _replyController,
            maxLines: 5,
            textCapitalization: TextCapitalization.sentences,
            enabled: !provider.isReplying,
            decoration: const InputDecoration(
              hintText: 'Write your reply...',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: provider.isReplying ? null : _handleReply,
              icon: provider.isReplying
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.send),
              label: Text(
                contact.isReplied ? 'Send Updated Reply' : 'Send Reply',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(bool isReplied) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isReplied
            ? AppColors.success.withAlpha(26)
            : AppColors.accent.withAlpha(26),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isReplied
              ? AppColors.success.withAlpha(77)
              : AppColors.accent.withAlpha(77),
        ),
      ),
      child: Text(
        isReplied ? 'Replied' : 'Pending',
        style: TextStyle(
          color: isReplied ? AppColors.success : AppColors.accent,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final dt = DateTime.parse(dateStr);
      return '${dt.day}/${dt.month}/${dt.year} at ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } on Exception {
      return dateStr;
    }
  }
}
