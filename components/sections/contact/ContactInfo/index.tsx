import { Mail, Clock3, MapPin, ShieldCheck, MessageCircle } from "lucide-react";

const items = [
  {
    icon: Mail,
    title: "Email",
    value: "support@govmatch.in",
  },
  {
    icon: Clock3,
    title: "Response Time",
    value: "Within 24 Hours",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "India",
  },
];

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold">Contact Information</h2>

        <p className="mt-2 text-neutral-600">
          Reach us through the following channels.
        </p>

        <div className="mt-8 space-y-6">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="rounded-xl bg-primary-50 p-3 text-primary-600">
                <item.icon size={22} />
              </div>

              <div>
                <div className="font-semibold">{item.title}</div>

                <div className="text-neutral-600 text-sm">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-primary-600 p-8 text-white">
        <div className="mb-5">
          <MessageCircle size={34} />
        </div>

        <h3 className="text-xl font-bold">Need Quick Help?</h3>

        <p className="mt-4 text-primary-100 leading-7">
          Before contacting us, you may find your answer in our Help Center or
          Frequently Asked Questions.
        </p>

        <button className="mt-8 rounded-xl bg-white px-5 py-3 font-medium text-primary-700 transition hover:bg-primary-50">
          Browse FAQs
        </button>
      </div>

      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-600" size={26} />

          <div>
            <div className="font-semibold text-green-900">
              Your Privacy Matters
            </div>

            <div className="mt-1 text-sm text-green-700">
              Your personal information is encrypted and never shared with third
              parties.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
