import { User, MapPin, Phone, Mail, Calendar, Heart } from 'lucide-react';

export function Profile() {
  // Моковые данные профиля
  const profile = {
    name: 'Мария Ивановна Петрова',
    age: 78,
    address: 'ул. Ленина, д. 45, кв. 12',
    phone: '+7 (912) 345-67-89',
    email: 'maria.petrova@mail.ru',
    memberSince: 'Ноябрь 2024',
    helpedCount: 3,
    receivedHelpCount: 5,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-800">Мой профиль</h2>
        <p className="text-gray-600 mt-2">
          Ваши личные данные и статистика
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8">
        {/* Avatar and Name */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="text-white" size={48} />
          </div>
          <div>
            <h3 className="text-gray-900">{profile.name}</h3>
            <p className="text-gray-600 mt-1">{profile.age} лет</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6 mb-8">
          <h3 className="text-gray-800">Контактная информация</h3>
          
          <div className="flex items-start gap-4">
            <MapPin className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-gray-600 text-sm">Адрес</p>
              <p className="text-gray-900">{profile.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-gray-600 text-sm">Телефон</p>
              <p className="text-gray-900">{profile.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-900">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Calendar className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-gray-600 text-sm">Участник с</p>
              <p className="text-gray-900">{profile.memberSince}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="pt-8 border-t-2 border-gray-100">
          <h3 className="text-gray-800 mb-6">Статистика</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-green-600" size={24} />
                <p className="text-green-900">Помог людям</p>
              </div>
              <p className="text-green-600">{profile.helpedCount} раз</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-blue-600" size={24} />
                <p className="text-blue-900">Получил помощь</p>
              </div>
              <p className="text-blue-600">{profile.receivedHelpCount} раз</p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-8">
          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors">
            Редактировать профиль
          </button>
        </div>
      </div>
    </div>
  );
}
