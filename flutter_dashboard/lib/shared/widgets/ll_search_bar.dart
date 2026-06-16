import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';

class LlSearchBar extends StatefulWidget {
  const LlSearchBar({
    super.key,
    required this.onChanged,
    this.hintText = 'Search...',
  });

  final ValueChanged<String> onChanged;
  final String hintText;

  @override
  State<LlSearchBar> createState() => _LlSearchBarState();
}

class _LlSearchBarState extends State<LlSearchBar> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: Icon(Icons.search, color: AppColors.muted, size: 20),
          ),
          Expanded(
            child: TextField(
              controller: _controller,
              onChanged: widget.onChanged,
              decoration: InputDecoration(
                hintText: widget.hintText,
                hintStyle: const TextStyle(color: AppColors.muted, fontSize: 14),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                isDense: true,
              ),
              style: const TextStyle(color: AppColors.text, fontSize: 14),
            ),
          ),
          if (_controller.text.isNotEmpty)
            GestureDetector(
              onTap: () {
                _controller.clear();
                widget.onChanged('');
              },
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: Icon(Icons.close, color: AppColors.muted, size: 18),
              ),
            ),
        ],
      ),
    );
  }
}
