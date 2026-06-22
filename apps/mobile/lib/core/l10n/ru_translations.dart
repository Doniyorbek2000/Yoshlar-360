const Map<String, String> ruTranslations = {
  // Common
  'app_name': 'Ёшлар 360',
  'loading': 'Загрузка...',
  'error': 'Ошибка',
  'retry': 'Повторить',
  'cancel': 'Отмена',
  'save': 'Сохранить',
  'delete': 'Удалить',
  'edit': 'Редактировать',
  'search': 'Поиск',
  'filter': 'Фильтр',
  'all': 'Все',
  'yes': 'Да',
  'no': 'Нет',
  'ok': 'ОК',
  'close': 'Закрыть',
  'back': 'Назад',
  'next': 'Далее',
  'submit': 'Отправить',
  'confirm': 'Подтвердить',
  'no_data': 'Нет данных',
  'success': 'Успешно',

  // Auth
  'login': 'Войти',
  'register': 'Регистрация',
  'logout': 'Выйти',
  'email': 'Эл. почта',
  'password': 'Пароль',
  'confirm_password': 'Подтвердите пароль',
  'full_name': 'ФИО',
  'phone': 'Телефон',
  'forgot_password': 'Забыли пароль?',
  'login_title': 'Вход в систему',
  'login_subtitle': 'Добро пожаловать в платформу Ёшлар 360',
  'register_title': 'Регистрация',
  'email_required': 'Введите email',
  'password_required': 'Введите пароль',
  'password_min_length': 'Пароль должен содержать не менее 6 символов',
  'invalid_email': 'Неверный формат email',

  // Onboarding
  'onboarding_title_1': 'Работа с молодёжью',
  'onboarding_desc_1': 'Единая платформа для эффективной работы с молодёжью',
  'onboarding_title_2': 'Управление обращениями',
  'onboarding_desc_2': 'Принимайте и отслеживайте обращения молодёжи',
  'onboarding_title_3': 'Статистика и отчёты',
  'onboarding_desc_3': 'Просматривайте статистику и отчёты в реальном времени',
  'get_started': 'Начать',
  'skip': 'Пропустить',

  // Dashboard
  'dashboard': 'Главная',
  'total_youth': 'Всего молодёжи',
  'total_appeals': 'Всего обращений',
  'new_appeals': 'Новые обращения',
  'resolved_appeals': 'Решённые',
  'total_problems': 'Всего проблем',
  'total_tasks': 'Всего задач',
  'done_tasks': 'Выполненные задачи',
  'overdue_tasks': 'Просроченные',
  'recent_appeals': 'Последние обращения',
  'quick_actions': 'Быстрые действия',

  // Appeals
  'appeals': 'Обращения',
  'appeal': 'Обращение',
  'new_appeal': 'Новое обращение',
  'appeal_title': 'Заголовок',
  'appeal_description': 'Описание',
  'appeal_category': 'Категория',
  'appeal_priority': 'Приоритет',
  'appeal_status': 'Статус',
  'appeal_created': 'Обращение отправлено',
  'appeal_comments': 'Комментарии',
  'add_comment': 'Добавить комментарий',
  'select_region': 'Выберите область',
  'select_district': 'Выберите район',
  'select_mahalla': 'Выберите махаллю',

  // Youth
  'youth': 'Молодёжь',
  'youth_database': 'База молодёжи',
  'youth_profile': 'Профиль молодёжи',
  'age': 'Возраст',
  'gender': 'Пол',
  'male': 'Мужской',
  'female': 'Женский',
  'education': 'Образование',
  'employment': 'Занятость',
  'address': 'Адрес',

  // Tasks
  'tasks': 'Задачи',
  'task': 'Задача',
  'task_title': 'Название задачи',
  'task_description': 'Описание задачи',
  'task_status': 'Статус',
  'task_deadline': 'Срок',
  'task_assignee': 'Ответственный',
  'todo': 'К выполнению',
  'in_progress': 'В процессе',
  'done': 'Выполнено',
  'cancelled': 'Отменено',

  // Problems
  'problems': 'Проблемы',
  'problem': 'Проблема',
  'risk_level': 'Уровень риска',

  // Notifications
  'notifications': 'Уведомления',
  'mark_all_read': 'Отметить все как прочитанные',
  'no_notifications': 'Нет уведомлений',

  // Profile
  'profile': 'Профиль',
  'my_profile': 'Мой профиль',
  'role': 'Должность',
  'region': 'Область',
  'district': 'Район',
  'mahalla': 'Махалля',

  // Settings
  'settings': 'Настройки',
  'language': 'Язык',
  'theme': 'Тема',
  'dark_mode': 'Тёмный режим',
  'about': 'О приложении',
  'version': 'Версия',
  'privacy_policy': 'Политика конфиденциальности',
  'terms_of_use': 'Условия использования',
  'contact_support': 'Поддержка',

  // Status
  'status_new': 'Новый',
  'status_in_progress': 'В процессе',
  'status_resolved': 'Решён',
  'status_rejected': 'Отклонён',
  'status_closed': 'Закрыт',

  // Priority
  'priority_low': 'Низкий',
  'priority_medium': 'Средний',
  'priority_high': 'Высокий',
  'priority_urgent': 'Срочный',

  // Categories
  'category_employment': 'Занятость',
  'category_education': 'Образование',
  'category_housing': 'Жильё',
  'category_healthcare': 'Здравоохранение',
  'category_social': 'Социальное',
  'category_legal': 'Юридическое',
  'category_other': 'Другое',

  // Roles
  'role_super_admin': 'Супер Админ',
  'role_republic_admin': 'Админ республики',
  'role_region_admin': 'Админ области',
  'role_district_admin': 'Админ района',
  'role_mahalla_leader': 'Лидер махалли',
  'role_youth': 'Молодёжь',
  'role_moderator': 'Модератор',

  // KPI
  'kpi': 'Показатели KPI',
  'kpi_score': 'Балл',

  // Reports
  'reports': 'Отчёты',
};
