import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../models/contact_model.dart';
import '../../providers/contact_provider.dart';
import '../../shared/widgets/app_drawer.dart';
import '../../shared/widgets/ll_app_bar.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ContactProvider>().loadContacts();
    });
  }

  Future<void> _confirmDelete(ContactModel contact) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Message'),
        content: Text('Delete message from "${contact.name}"?'),
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
      await context.read<ContactProvider>().deleteContact(contact);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: const LlAppBar(title: 'Messages'),
      body: Consumer<ContactProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (provider.contacts.isEmpty) {
            return _buildEmptyState();
          }
          return RefreshIndicator(
            onRefresh: provider.loadContacts,
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: provider.contacts.length,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (_, i) => _buildContactCard(provider.contacts[i]),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.mail_outlined, size: 64, color: AppColors.border),
          SizedBox(height: 16),
          Text(
            'No messages',
            style: TextStyle(color: AppColors.muted, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCard(ContactModel contact) {
    return Dismissible(
      key: Key('contact_${contact.id}'),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => _confirmDelete(contact),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.accent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      child: InkWell(
        onTap: () => context.push('/contact/${contact.id}'),
        borderRadius: BorderRadius.circular(8),
        child: Container(
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
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  _buildStatusBadge(contact.isReplied),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                contact.subject,
                style: const TextStyle(
                  color: AppColors.text,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                contact.email,
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
              const SizedBox(height: 6),
              Text(
                contact.message,
                style: const TextStyle(
                  color: AppColors.muted,
                  fontSize: 12,
                  height: 1.4,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
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
}
