import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../providers/appeals_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class CreateAppealPage extends ConsumerStatefulWidget {
  const CreateAppealPage({super.key});

  @override
  ConsumerState<CreateAppealPage> createState() => _CreateAppealPageState();
}

class _CreateAppealPageState extends ConsumerState<CreateAppealPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedCategory = 'OTHER';
  String _selectedPriority = 'MEDIUM';
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final user = ref.read(currentUserProvider);
      await ref.read(appealsProvider.notifier).createAppeal({
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'category': _selectedCategory,
        'priority': _selectedPriority,
        if (user?.regionId != null) 'regionId': user!.regionId,
        if (user?.districtId != null) 'districtId': user!.districtId,
        if (user?.mahallaId != null) 'mahallaId': user!.mahallaId,
      });

      if (mounted) {
        Helpers.showSnackBar(context, 'Murojaat yuborildi');
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(context, e.toString(), isError: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Yangi murojaat')),
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _titleController,
                  validator: (v) => Validators.required(v, 'Sarlavha'),
                  decoration: const InputDecoration(
                    labelText: 'Sarlavha',
                    prefixIcon: Icon(Icons.title),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _descriptionController,
                  validator: (v) => Validators.required(v, 'Tavsif'),
                  maxLines: 5,
                  decoration: const InputDecoration(
                    labelText: 'Tavsif',
                    alignLabelWithHint: true,
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: 80),
                      child: Icon(Icons.description),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Kategoriya',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: AppConstants.appealCategories.map((category) {
                    final isSelected = category == _selectedCategory;
                    return ChoiceChip(
                      label: Text(_getCategoryLabel(category)),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() => _selectedCategory = category);
                        }
                      },
                      selectedColor: AppColors.primary.withValues(alpha: 0.2),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Muhimlik darajasi',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: AppConstants.priorities.map((priority) {
                    final isSelected = priority == _selectedPriority;
                    final color = Helpers.getPriorityColor(priority);
                    return ChoiceChip(
                      label: Text(Helpers.getPriorityLabel(priority)),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() => _selectedPriority = priority);
                        }
                      },
                      selectedColor: color.withValues(alpha: 0.2),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    child: const Text('Yuborish'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getCategoryLabel(String category) {
    switch (category) {
      case 'EMPLOYMENT':
        return 'Bandlik';
      case 'EDUCATION':
        return 'Ta\'lim';
      case 'HOUSING':
        return 'Uy-joy';
      case 'HEALTHCARE':
        return 'Sog\'liq';
      case 'SOCIAL':
        return 'Ijtimoiy';
      case 'LEGAL':
        return 'Huquqiy';
      case 'OTHER':
        return 'Boshqa';
      default:
        return category;
    }
  }
}
