/**
 * Memory Graph System Demo
 *
 * Demonstrates the core functionality of the memory graph system
 * with practical examples.
 */

import { MemoryGraph, IngestorAgent, PlannerAgent } from './index'

export async function runDemo() {
  console.log('🧠 Memory Graph System Demo\n')

  // Initialize the system
  const graph = new MemoryGraph()
  const ingestor = new IngestorAgent(graph)
  const planner = new PlannerAgent(graph)

  console.log('1. 📥 Ingesting deployment information...')

  // Ingest some realistic deployment scenarios
  await ingestor.ingestText(
    `The crm7 service requires SUPABASE_URL and SUPABASE_ANON_KEY environment variables. 
     It depends on postgres database and connects to redis cache for session storage.
     The service is deployed to production environment and managed by team alpha.`,
    'deployment-docs'
  )

  await ingestor.ingestText(
    `Issue #101 was caused by missing SUPABASE_URL configuration in production environment.
     The auth service also depends on postgres database and requires JWT_SECRET configuration.
     Developer john owns the payment api which connects to the same postgres database.`,
    'incident-report'
  )

  await ingestor.ingestText(
    `The notification service connects to redis cache and requires SMTP_HOST configuration.
     Task #456 is pending to update the database schema for the crm7 service.`,
    'task-management'
  )

  // Show what was extracted
  const stats = graph.getStats()
  console.log(`   ✅ Extracted ${stats.nodeCount} entities and ${stats.edgeCount} relationships`)
  console.log(
    `   📊 Node types:`,
    Object.entries(stats.nodeTypes)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ')
  )

  console.log('\n2. 🔍 Querying the graph...')

  // Query for services
  const services = graph.query({ nodeType: 'Service' })
  console.log(
    `   🔧 Found ${services.nodes.length} services:`,
    services.nodes.map(n => n.properties.name).join(', ')
  )

  // Query for configurations
  const configs = graph.query({ nodeType: 'Configuration' })
  console.log(
    `   ⚙️  Found ${configs.nodes.length} configurations:`,
    configs.nodes.map(n => n.properties.key).join(', ')
  )

  // Query for incidents
  const incidents = graph.query({ nodeType: 'Incident' })
  console.log(
    `   🚨 Found ${incidents.nodes.length} incidents:`,
    incidents.nodes.map(n => `#${n.properties.number}`).join(', ')
  )

  console.log('\n3. 🎯 Risk Analysis...')

  // Analyze risks for CRM service
  if (services.nodes.length > 0) {
    const crmService = services.nodes.find(n => n.properties.name?.toLowerCase().includes('crm'))
    if (crmService) {
      const risks = await planner.analyzeRisks(crmService.id)
      console.log(`   📈 Risk analysis for ${risks.service}:`)
      console.log(`      • Risk Score: ${risks.riskScore}`)
      console.log(`      • Dependencies: ${risks.dependencies.join(', ') || 'None'}`)
      console.log(`      • Related Incidents: ${risks.relatedIncidents.length}`)
      console.log(`      • Missing Configs: ${risks.missingConfigurations.length}`)
    }
  }

  console.log('\n4. 💡 Action Recommendations...')

  // Get recommendations
  const recommendations = await planner.suggestNextAction('deployment context')
  console.log(`   📋 Found ${recommendations.length} recommendations:`)

  recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`      ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`)
    console.log(`         💪 Effort: ${rec.estimatedEffort}, Impact: ${rec.impactScore}`)
    console.log(`         🔗 Related: ${rec.relatedEntities.length} entities`)
  })

  console.log('\n5. 🕸️  Dependency Analysis...')

  // Analyze dependencies for a service
  if (services.nodes.length > 0) {
    const serviceToAnalyze = services.nodes[0]
    try {
      const depAnalysis = planner.analyzeDependencies(serviceToAnalyze.id)
      console.log(`   🔗 Dependencies for ${depAnalysis.entity}:`)
      console.log(`      • Direct: ${depAnalysis.directDependencies.length}`)
      console.log(`      • Transitive: ${depAnalysis.transitiveDependencies.length}`)
      console.log(`      • Dependents: ${depAnalysis.dependents.length}`)
      console.log(`      • Risk Factors: ${depAnalysis.riskFactors.length}`)

      if (depAnalysis.riskFactors.length > 0) {
        console.log(`      ⚠️  Risks: ${depAnalysis.riskFactors.join(', ')}`)
      }
    } catch (error) {
      console.log(`      ℹ️  No dependency data available for ${serviceToAnalyze.properties.name}`)
    }
  }

  console.log('\n6. 💥 Impact Analysis...')

  // Analyze impact for a critical service
  if (services.nodes.length > 0) {
    const serviceToAnalyze = services.nodes[0]
    try {
      const impactAnalysis = planner.analyzeImpact(serviceToAnalyze.id)
      console.log(`   💥 Impact analysis for ${impactAnalysis.entity}:`)
      console.log(`      • Risk Level: ${impactAnalysis.riskLevel.toUpperCase()}`)
      console.log(`      • Direct Impact: ${impactAnalysis.directImpact.length} entities`)
      console.log(`      • Cascading Impact: ${impactAnalysis.cascadingImpact.length} entities`)
      console.log(`      • Affected Services: ${impactAnalysis.affectedServices.length}`)
      console.log(`      • Affected Users: ${impactAnalysis.affectedUsers.length}`)
    } catch (error) {
      console.log(`      ℹ️  No impact data available for ${serviceToAnalyze.properties.name}`)
    }
  }

  console.log('\n7. 🔄 Graph Serialization...')

  // Demonstrate serialization
  const serialized = graph.toJSON()
  console.log(`   💾 Serialized graph: ${(serialized.length / 1024).toFixed(1)}KB`)

  // Load into new graph
  const newGraph = MemoryGraph.fromJSON(serialized)
  const newStats = newGraph.getStats()
  console.log(`   ✅ Deserialized: ${newStats.nodeCount} nodes, ${newStats.edgeCount} edges`)

  console.log('\n🎉 Demo completed! The memory graph system is working correctly.\n')

  return {
    graph,
    ingestor,
    planner,
    stats,
    services: services.nodes,
    configs: configs.nodes,
    incidents: incidents.nodes,
    recommendations,
  }
}

// Export for use in other files
export { runDemo as default }
