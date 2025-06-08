import Ajv from 'ajv';
import addFormats from 'ajv-formats';

class ValidationService {
  constructor() {
    this.ajv = new Ajv({ 
      strict: false,
      allErrors: true,
      coerceTypes: true // Permet la conversion automatique de types
    });
    addFormats(this.ajv);
    this.schemas = {};
    this.validators = {};
  }

  async init() {
    try {
      // Chargement dynamique des schémas
      const [noyau, lambda, partie, fpsMode, partieReponse] = await Promise.all([
        import('../schemas/schema-noyau.json'),
        import('../schemas/schema-lambda.json'),
        import('../schemas/schema-partie.json'),
        import('../schemas/schema-fps-mode.json'),
        import('../schemas/schema-partie-reponse.json')
      ]);
    
      this.schemas = {
        core: noyau.default,
        lambda: lambda.default,
        partie: partie.default,
        'fps-mode': fpsMode.default,
        'partie-reponse': partieReponse.default
      };

      // Ajoute tous les schémas à AJV pour la résolution des $ref
      this.ajv.addSchema(noyau.default, 'schema-noyau.json');
      this.ajv.addSchema(lambda.default, 'schema-lambda.json');
      this.ajv.addSchema(partie.default, 'schema-partie.json');
      this.ajv.addSchema(fpsMode.default, 'schema-fps-mode.json');
      this.ajv.addSchema(partieReponse.default, 'schema-partie-reponse.json');

      this.compileSchemas();
    } catch (error) {
      console.error("Erreur de chargement des schémas:", error);
    }
  }

  compileSchemas() {
    for (const [name, schema] of Object.entries(this.schemas)) {
      try {
        this.validators[name] = this.ajv.compile(schema);
      } catch (error) {
        console.error(`Erreur de compilation du schéma ${name}:`, error);
      }
    }
  }

  getSchema(name) {
    return this.schemas[name];
  }

  getSchemaDefinition(typeName) {
    if (!this.schemas.core) return null;
    
    // Recherche dans les définitions du schéma noyau
    const typeDefinition = this.schemas.core.definitions[typeName];
    if (typeDefinition) return typeDefinition;
    
    return null;
  }

  validate(data, schemaName) {
    if (!this.validators[schemaName]) {
      return {
        isValid: false,
        errors: [{ 
          message: `Schéma ${schemaName} non trouvé`,
          instancePath: '',
          params: {}
        }]
      };
    }
    
    const isValid = this.validators[schemaName](data);
    
    if (!isValid) {
      // Améliorer les messages d'erreur
      const enhancedErrors = this.validators[schemaName].errors.map(error => {
        let message = error.message;
        
        if (error.keyword === 'required') {
          message = `Le champ ${error.params.missingProperty} est requis`;
        } else if (error.keyword === 'minLength') {
          message = `Doit contenir au moins ${error.params.limit} caractères`;
        } else if (error.keyword === 'type') {
          message = `Type invalide: doit être ${error.params.type}`;
        }
        
        return {
          ...error,
          message: message || 'Erreur de validation'
        };
      });
      
      return {
        isValid,
        errors: enhancedErrors
      };
    }
    
    return {
      isValid,
      errors: []
    };
  }

  isSchemaSupported(schemaName, version) {
    return this.schemas[schemaName]?.schemaVersion === version;
  }
}

const instance = new ValidationService();
instance.init();

export default instance;