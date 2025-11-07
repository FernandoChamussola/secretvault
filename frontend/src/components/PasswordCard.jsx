function PasswordCard({ password, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {password.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {password.description || 'Sem descrição'}
      </p>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onView(password)}
          className="flex-1 min-w-[80px] px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Ver
        </button>
        <button
          onClick={() => onEdit(password)}
          className="flex-1 min-w-[80px] px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(password)}
          className="flex-1 min-w-[80px] px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
        >
          Deletar
        </button>
      </div>
    </div>
  );
}

export default PasswordCard;
