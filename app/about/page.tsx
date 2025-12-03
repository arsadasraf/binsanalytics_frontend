"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] bg-gradient-to-r from-yellow-600 to-indigo-700 flex items-center justify-center text-white">
        <div className="text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Bins Analytics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-2xl max-w-2xl mx-auto"
          >
            Empowering manufacturing companies with intelligent resource
            management through AI-driven analytics.
          </motion.p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-indigo-700">
              About Our SaaS Platform
            </h2>
            <p className="mb-4 text-lg">
              Bins Analytics is a next-generation SaaS application designed
              specifically for manufacturing companies. We help industries
              manage their day-to-day operations with powerful tools built to
              optimize machines, manpower, and raw materials.
            </p>
            <p className="text-lg">
              Using advanced AI models, we analyze factory workflows,
              production efficiency, resource consumption, and downtime
              patterns to provide actionable insights that increase
              productivity and reduce operational waste.
            </p>
          </motion.div>

          {/* Sliding Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl shadow-xl h-80"
          >
            <motion.div
              className="flex h-full"
              animate={{ x: [0, -300, -600, 0] }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            >
              <Image
                src="/images/factory1.jpg"
                alt="Factory"
                width={600}
                height={400}
                className="object-cover h-full w-[300px]"
              />
              <Image
                src="/images/factory2.jpg"
                alt="Production"
                width={600}
                height={400}
                className="object-cover h-full w-[300px]"
              />
              <Image
                src="/images/appstore.png"
                alt="Machines"
                width={600}
                height={400}
                className="object-cover h-full w-[300px]"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white px-6 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-indigo-700">
          Key Features
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-3">Machine Analytics</h3>
            <p>
              Monitor machine performance, breakdown patterns, idle time, and
              efficiency using real-time dashboards.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-3">Manpower Optimization</h3>
            <p>
              AI-powered workforce planning ensures the right manpower is
              available at the right time for maximum output.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-3">Raw Material Planning</h3>
            <p>
              Predict material demand, reduce wastage, and avoid shortages with
              smart forecasting models.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10">
          Trusted By Leading Companies
        </h2>
        <div className="flex gap-10 justify-center flex-wrap opacity-80">
          <div className="w-40 h-20 bg-gray-200 rounded-xl"></div>
          <div className="w-40 h-20 bg-gray-200 rounded-xl"></div>
          <div className="w-40 h-20 bg-gray-200 rounded-xl"></div>
          <div className="w-40 h-20 bg-gray-200 rounded-xl"></div>
        </div>
      </section>

      {/* Footer */}
     <Footer />
    </div>
  );
}
