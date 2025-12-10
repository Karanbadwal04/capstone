export default function ListingCard({ title, price, image }) {
  return (
    <div className="bg-brand-card rounded-lg overflow-hidden hover:border-brand-orange border-2 border-transparent transition">
      {image && <img src={image} alt={title} className="w-full h-40 object-cover" />}
      <div className="p-4">
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-brand-orange font-bold text-lg">₹{price}</p>
      </div>
    </div>
  );
}