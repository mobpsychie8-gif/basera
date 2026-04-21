import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../lib/api";
import { ArrowLeft, ArrowRight, Check, Upload, X, ImagePlus } from "lucide-react";

const STEPS = ["Basic Info", "Location", "Amenities", "Review & Submit"];

const amOpts = [
  "wifi","parking","water-supply","electricity","kitchen",
  "washing-machine","ac","heater","attached-bathroom","balcony","cctv","guard"
];

export default function PostRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", price: "", deposit: "", type: "single",
    furnishing: "semi-furnished", bedrooms: 1, bathrooms: 1, floor: "",
    "location.address": "", "location.area": "", "location.city": "Srinagar",
    contactPhone: "", amenities: [], images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  if (!user) return <div className="text-center py-20">Please <a href="/login" className="text-primary-600 underline">login</a> to post a room.</div>;
  if (user.role !== "landlord") return <div className="text-center py-20">Only landlords can post rooms.</div>;

  const handleChange = e => {
    const { name, value, checked, files } = e.target;
    if (name === "amenities") {
      setForm(f => ({ ...f, amenities: checked ? [...f.amenities, value] : f.amenities.filter(a => a !== value) }));
    } else if (name === "images") {
      const newFiles = Array.from(files);
      setForm(f => ({ ...f, images: [...f.images, ...newFiles].slice(0, 5) }));
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => setImagePreviews(prev => [...prev, { url: ev.target.result, name: file.name }].slice(0, 5));
        reader.readAsDataURL(file);
      });
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const removeImage = idx => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const canNext = () => {
    if (step === 0) return form.title && form.description && form.price;
    if (step === 1) return form["location.address"] && form["location.area"];
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title: form.title, description: form.description,
        price: Number(form.price), deposit: Number(form.deposit) || 0,
        type: form.type, furnishing: form.furnishing,
        bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
        floor: form.floor ? Number(form.floor) : undefined,
        location: {
          address: form["location.address"],
          area: form["location.area"],
          city: form["location.city"]
        },
        contactPhone: form.contactPhone,
        amenities: form.amenities
      };

      // If images exist, upload via FormData
      if (form.images.length > 0) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (k === "location") fd.append(k, JSON.stringify(v));
          else if (k === "amenities") v.forEach(a => fd.append("amenities[]", a));
          else if (v !== undefined) fd.append(k, v);
        });
        form.images.forEach(img => fd.append("images", img));
        await API.post("/rooms", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await API.post("/rooms", payload);
      }
      navigate("/dashboard");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to post room");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Post a Room</h1>
      <p className="text-gray-500 mb-6">Fill in the details step by step</p>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 ${i <= step ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`ml-2 text-sm hidden sm:block ${i <= step ? "text-primary-700 font-medium" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-primary-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. Spacious room near GU" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe the room, surroundings, nearby landmarks..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rent (₹) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deposit (₹)</label>
                <input name="deposit" type="number" value={form.deposit} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="flat">Flat</option>
                  <option value="pg">PG</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beds</label>
                <input name="bedrooms" type="number" min="1" value={form.bedrooms} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Baths</label>
                <input name="bathrooms" type="number" min="1" value={form.bathrooms} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Furnishing</label>
                <select name="furnishing" value={form.furnishing} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="fully-furnished">Fully Furnished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Floor</label>
                <input name="floor" type="number" value={form.floor} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. 2" />
              </div>
            </div>
          </>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Location Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input name="location.address" value={form["location.address"]} onChange={handleChange} required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="House/Flat no., Street, Landmark" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Area *</label>
                <input name="location.area" value={form["location.area"]} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Garhwal University, Chauras" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input name="location.city" value={form["location.city"]} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Phone number for tenants to reach you" />
            </div>
          </>
        )}

        {/* Step 2: Amenities & Images */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Amenities & Photos</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amOpts.map(a => (
                  <label key={a}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm cursor-pointer border transition-colors ${form.amenities.includes(a) ? "bg-primary-50 border-primary-400 text-primary-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    <input type="checkbox" name="amenities" value={a} checked={form.amenities.includes(a)} onChange={handleChange} className="sr-only" />
                    <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${form.amenities.includes(a) ? "bg-primary-600 border-primary-600 text-white" : "border-gray-300"}`}>
                      {form.amenities.includes(a) && <Check className="w-3 h-3" />}
                    </span>
                    {a.replace(/-/g, " ")}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Photos (max 5)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input type="file" name="images" accept="image/*" multiple onChange={handleChange}
                  className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload photos</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 5 images</span>
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex gap-3 mt-3 flex-wrap">
                  {imagePreviews.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Basic Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Title:</span><span className="font-medium">{form.title}</span>
                  <span className="text-gray-500">Rent:</span><span className="font-medium">₹{Number(form.price).toLocaleString("en-IN")}/mo</span>
                  {form.deposit && <><span className="text-gray-500">Deposit:</span><span className="font-medium">₹{Number(form.deposit).toLocaleString("en-IN")}</span></>}
                  <span className="text-gray-500">Type:</span><span className="font-medium capitalize">{form.type}</span>
                  <span className="text-gray-500">Beds/Baths:</span><span className="font-medium">{form.bedrooms} / {form.bathrooms}</span>
                  <span className="text-gray-500">Furnishing:</span><span className="font-medium">{form.furnishing.replace("-", " ")}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{form.description}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Location</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Address:</span><span className="font-medium">{form["location.address"]}</span>
                  <span className="text-gray-500">Area:</span><span className="font-medium">{form["location.area"]}</span>
                  <span className="text-gray-500">City:</span><span className="font-medium">{form["location.city"]}</span>
                  {form.contactPhone && <><span className="text-gray-500">Phone:</span><span className="font-medium">{form.contactPhone}</span></>}
                </div>
              </div>
              {form.amenities.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {form.amenities.map(a => (
                      <span key={a} className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-sm">{a.replace(/-/g, " ")}</span>
                    ))}
                  </div>
                </div>
              )}
              {imagePreviews.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Photos ({imagePreviews.length})</h3>
                  <div className="flex gap-2 flex-wrap">
                    {imagePreviews.map((img, i) => (
                      <img key={i} src={img.url} alt="" className="w-16 h-16 rounded object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t mt-6">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium ${canNext() ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 bg-primary-600 text-white px-8 py-2.5 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50">
              {submitting ? "Submitting..." : <><Check className="w-4 h-4" /> Submit Listing</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
