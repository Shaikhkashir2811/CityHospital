import React from 'react';
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavBar from '../components/navbar';

const Services = () => {
  const allServices = [
    { 
      title: "Cardiology", 
      desc: "Comprehensive heart care using the latest non-invasive diagnostic technology.", 
      img: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400" 
    },
    { 
      title: "Neurology", 
      desc: "Specialized treatment for brain disorders, spinal injuries, and nerve care.", 
      img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400" 
    },
    { 
      title: "Pediatrics", 
      desc: "Gentle and expert medical attention for your children from birth through teens.", 
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe9ZMk_vtLrUjdv6aRN5KpKGjrVV3yMGEdY78XfFy3Xg&s" 
    },
    { 
      title: "Gynecology", 
      desc: "Complete women's wellness, maternity support, and reproductive healthcare.", 
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbLw8s8rIzdCUY_Ttui13hleENlGj1XC_Z1Q&s" 
    },
    { 
      title: "Orthopedics", 
      desc: "Advanced bone and joint care, physical therapy, and sports medicine.", 
      img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400" 
    },
    { 
      title: "Dermatology", 
      desc: "Expert skin diagnostics, allergy treatments, and clinical dermatology.", 
      img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400" 
    },
    { 
      title: "Diagnostics", 
      desc: "Precision laboratory testing, MRI, CT scans, and digital X-rays.", 
      img: "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=400" 
    },
    { 
      title: "Emergency", 
      desc: "24/7 trauma response and critical care for life-threatening conditions.", 
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKmEyIC0hvrWE3ydJzuxQPHRV4nUhKF-ZG03FKkCeYLQ&s" 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
        <NavBar />
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Content */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase mb-4 tracking-wider">
              <ShieldCheck size={14} />
              Accredited Medical Center
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              Advanced Medical <br /> Departments & Services
            </h1>
          </div>
          <p className="text-slate-500 font-medium max-w-sm">
            Providing specialized care across multiple disciplines with world-class infrastructure.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allServices.map((service, index) => (
            <div key={index} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
              
              {/* Image Container with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.img} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Content Container */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                  {service.desc}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <Link 
                    to="/booking" 
                    className="text-green-600 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    BOOK NOW <ArrowRight size={14} />
                  </Link>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold">24/7 AVAIL</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-20 rounded-[3rem] bg-gradient-to-r from-green-600 to-green-800 p-1 lg:p-2 shadow-2xl">
           <div className="bg-white/5 backdrop-blur-sm rounded-[2.8rem] p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-white">
                <h2 className="text-3xl font-black mb-2">Need a General Checkup?</h2>
                <p className="text-green-100 font-medium">Walk-ins available for primary care and general consultations.</p>
              </div>
              <Link 
                to="/booking"
                className="bg-white text-green-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-50 transition-all active:scale-95"
              >
                Schedule Checkup
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Services;